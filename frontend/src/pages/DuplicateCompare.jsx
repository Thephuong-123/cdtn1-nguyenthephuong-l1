
import { useCallback, useEffect, useRef, useState } from 'react';
import { duplicateApi } from '../api/duplicate.api';
import { mergeApi } from '../api/merge.api';
import DataState from '../components/DataState';

const fields = [
  { key: 'full_name', label: 'Họ và tên' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Địa chỉ' },
];

export default function DuplicateCompare({ candidateId, onBack, user }) {
  const isManager = user?.role === 'MANAGER';
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [primaryId, setPrimaryId] = useState('');
  const [fieldChoices, setFieldChoices] = useState({});
  const [managerConfirmed, setManagerConfirmed] = useState(false);

  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');
  const [mergeSuccess, setMergeSuccess] = useState('');
  const requestId = useRef(0);

  const loadCandidate = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const data = await duplicateApi.getById(candidateId);
      if (current !== requestId.current) return;

      setCandidate(data);
      setPrimaryId(String(data.customer_id_1));

      setFieldChoices({
        full_name: 'A',
        phone: 'A',
        email: 'A',
        address: 'A',
      });

      setManagerConfirmed(false);
      setMergeError('');
      setMergeSuccess('');
    } catch (err) {
      if (current !== requestId.current) return;
      setCandidate(null);
      setError(err.message);
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadCandidate();
    });

    return () => {
      cancelled = true;
      requestId.current += 1;
    };
  }, [loadCandidate]);

  function choosePrimary(id, side) {
    setPrimaryId(String(id));

    // Mặc định lấy thông tin từ hồ sơ chính vừa chọn
    setFieldChoices({
      full_name: side,
      phone: side,
      email: side,
      address: side,
    });

    setManagerConfirmed(false);
    setMergeError('');
  }

  function chooseField(key, side) {
    setFieldChoices(old => ({
      ...old,
      [key]: side,
    }));

    setManagerConfirmed(false);
    setMergeError('');
  }

  async function handleMerge() {
    if (!candidate || merging || mergeSuccess) return;

    if (!isManager) {
      setMergeError('Chỉ tài khoản MANAGER mới được phép gộp hồ sơ.');
      return;
    }

    setMergeError('');

    if (candidate.status !== 'PENDING') {
      setMergeError('Cặp hồ sơ này không còn ở trạng thái chờ xử lý.');
      return;
    }

    if (!managerConfirmed) {
      setMergeError('Vui lòng xác nhận trước khi gộp.');
      return;
    }

    const sourceA = candidate.customer_1;
    const sourceB = candidate.customer_2;

    if (!sourceA || !sourceB) {
      setMergeError('Không tìm thấy dữ liệu hai hồ sơ.');
      return;
    }

    const selectedData = {};

    for (const field of fields) {
      const side = fieldChoices[field.key];
      const source = side === 'B' ? sourceB : sourceA;

      selectedData[field.key] = source[field.key] ?? '';
    }

    const accepted = window.confirm(
      'Bạn có chắc chắn muốn gộp hai hồ sơ?\n' +
      'Hồ sơ phụ sẽ bị vô hiệu hóa.\n' +
      'Thao tác này thay đổi dữ liệu PostgreSQL.'
    );

    if (!accepted) return;

    setMerging(true);

    try {
      const result = await mergeApi.merge({
        candidate_id: Number(candidate.candidate_id),
        primary_customer_id: Number(primaryId),

        // Backend xác định người quản lý từ JWT, không tin ID do client gửi.
        manager_confirmed: true,

        selected_data: selectedData,
      });

      setMergeSuccess(
        result.message || 'Gộp hồ sơ thành công.'
      );

      setCandidate(old => ({
        ...old,
        status: 'MERGED',
      }));
    } catch (err) {
      setMergeError(err.message);
    } finally {
      setMerging(false);
    }
  }

  return (
    <section className="crm-panel">
      <div className="panel-heading">
        <div>
          <h2>So sánh và gộp hồ sơ khách hàng</h2>
          <p>
            Đối chiếu thông tin và lựa chọn dữ liệu cần giữ lại.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={merging}
        >
          ← Quay lại danh sách
        </button>
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!candidate}
        onRetry={loadCandidate}
      >
        {candidate && (
          <>
            <div className="feature-notice">
              <h3>Cặp hồ sơ #{candidate.candidate_id}</h3>
              <p>
                Trạng thái: <strong>{candidate.status}</strong>
              </p>
              <p>
                Chỉ gộp khi đã xác minh hai hồ sơ thuộc cùng
                một khách hàng.
              </p>
            </div>

            <div className="table-scroll">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>THÔNG TIN</th>
                    <th>HỒ SƠ A (#{candidate.customer_id_1})</th>
                    <th>HỒ SƠ B (#{candidate.customer_id_2})</th>
                    <th>ĐỐI CHIẾU</th>
                  </tr>
                </thead>

                <tbody>
                  {fields.map(field => {
                    const valueA =
                      candidate.customer_1?.[field.key] ?? '';

                    const valueB =
                      candidate.customer_2?.[field.key] ?? '';

                    const different =
                      String(valueA).trim() !==
                      String(valueB).trim();

                    return (
                      <tr key={field.key}>
                        <td><strong>{field.label}</strong></td>
                        <td>{valueA || 'Chưa có dữ liệu'}</td>
                        <td>{valueB || 'Chưa có dữ liệu'}</td>
                        <td>
                          <strong
                            style={{
                              color: different
                                ? '#b45309'
                                : '#168451',
                            }}
                          >
                            {different
                              ? 'Khác nhau'
                              : 'Giống nhau'}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              className="feature-notice"
              style={{ marginTop: 24 }}
            >
              <h3>US7 – Chọn hồ sơ chính</h3>
              <p>
                Hồ sơ chính sẽ tiếp tục hoạt động.
                Hồ sơ còn lại sẽ bị vô hiệu hóa.
              </p>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 10 }}>
                  <input
                    type="radio"
                    name="primary-customer"
                    checked={
                      primaryId === String(candidate.customer_id_1)
                    }
                    onChange={() =>
                      choosePrimary(candidate.customer_id_1, 'A')
                    }
                    disabled={merging || !!mergeSuccess}
                  />
                  {' '}Giữ hồ sơ A – {candidate.customer_1?.full_name}
                </label>

                <label style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name="primary-customer"
                    checked={
                      primaryId === String(candidate.customer_id_2)
                    }
                    onChange={() =>
                      choosePrimary(candidate.customer_id_2, 'B')
                    }
                    disabled={merging || !!mergeSuccess}
                  />
                  {' '}Giữ hồ sơ B – {candidate.customer_2?.full_name}
                </label>
              </div>
            </div>

            <div
              className="feature-notice"
              style={{ marginTop: 20 }}
            >
              <h3>Chọn thông tin giữ lại</h3>
              <p>
                Với mỗi trường, chọn dữ liệu từ hồ sơ A hoặc B.
              </p>

              <div className="table-scroll">
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>TRƯỜNG</th>
                      <th>CHỌN A</th>
                      <th>CHỌN B</th>
                    </tr>
                  </thead>

                  <tbody>
                    {fields.map(field => (
                      <tr key={field.key}>
                        <td><strong>{field.label}</strong></td>

                        {['A', 'B'].map(side => {
                          const source =
                            side === 'A'
                              ? candidate.customer_1
                              : candidate.customer_2;

                          return (
                            <td key={side}>
                              <label>
                                <input
                                  type="radio"
                                  name={`field-${field.key}`}
                                  checked={
                                    fieldChoices[field.key] === side
                                  }
                                  onChange={() =>
                                    chooseField(field.key, side)
                                  }
                                  disabled={merging || !!mergeSuccess}
                                />
                                {' '}
                                {source?.[field.key] ||
                                  'Chưa có dữ liệu'}
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className="feature-notice"
              style={{ marginTop: 20 }}
            >
              <h3>Xác nhận gộp hồ sơ</h3>

              <p>
                Hồ sơ chính: <strong>#{primaryId}</strong>
              </p>

              <label
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  marginTop: 16,
                }}
              >
                <input
                  type="checkbox"
                  checked={managerConfirmed}
                  onChange={event => {
                    setManagerConfirmed(event.target.checked);
                    setMergeError('');
                  }}
                  disabled={!isManager || merging || !!mergeSuccess}
                />

                <span>
                  Tôi đã kiểm tra và xác nhận hai hồ sơ thuộc cùng một khách hàng.
                </span>
              </label>

              <p
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: '#64748b',
                }}
              >
                {isManager
                  ? 'Bạn đang sử dụng quyền MANAGER. Hệ thống sẽ xác minh quyền lần nữa qua JWT.'
                  : 'Tài khoản SALES chỉ được xem và so sánh. Chỉ MANAGER được xác nhận gộp hồ sơ.'}
              </p>

              {mergeError && (
                <p
                  className="form-message error"
                  role="alert"
                  style={{ marginTop: 14 }}
                >
                  {mergeError}
                </p>
              )}

              {mergeSuccess && (
                <p
                  className="form-message success"
                  role="status"
                  style={{ marginTop: 14 }}
                >
                  {mergeSuccess}
                </p>
              )}

              <div
                className="form-actions"
                style={{ marginTop: 20 }}
              >
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleMerge}
                  disabled={
                    merging ||
                    !isManager ||
                    !managerConfirmed ||
                    !!mergeSuccess ||
                    candidate.status !== 'PENDING'
                  }
                >
                  {merging
                    ? 'Đang gộp hồ sơ...'
                    : mergeSuccess
                      ? 'Đã gộp thành công'
                      : 'Xác nhận gộp hồ sơ'}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onBack}
                  disabled={merging}
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </>
        )}
      </DataState>
    </section>
  );
}
