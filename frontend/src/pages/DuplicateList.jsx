import { useCallback, useEffect, useRef, useState } from 'react';
import { duplicateApi } from '../api/duplicate.api';
import DataState from '../components/DataState';
import DuplicateCompare from './DuplicateCompare';

export default function DuplicateList({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  // Tự quét và tải danh sách khi mở M3.
  const loadCandidates = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      await duplicateApi.scan();
      if (current !== requestId.current) return;

      const data = await duplicateApi.getAll();
      if (current !== requestId.current) return;

      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      if (current !== requestId.current) return;
      setError(err.message);
      setCandidates([]);
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadCandidates();
    });
    return () => {
      cancelled = true;
      requestId.current += 1;
    };
  }, [loadCandidates]);

  function handleBackToList() {
    setSelected(null);
    void loadCandidates();
  }

  if (selected) {
    return (
      <DuplicateCompare
        candidateId={selected.candidate_id}
        onBack={handleBackToList}
        user={user}
      />
    );
  }

  return (
    <section className="crm-panel">
      <div className="panel-heading">
        <div>
          <h2>Danh sách hồ sơ nghi trùng</h2>
          <p>
            Hệ thống tự động đối chiếu thông tin khách hàng
            và đề xuất các cặp hồ sơ cần xác minh.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="record-count">
            {loading || error ? '—' : candidates.length} cặp
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadCandidates}
            disabled={loading}
          >
            {loading ? 'Đang kiểm tra...' : 'Quét lại'}
          </button>
        </div>
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={candidates.length === 0}
        onRetry={loadCandidates}
      >
        <div className="table-scroll">
          <table className="customer-table">
            <thead>
              <tr>
                <th>MÃ CẶP</th>
                <th>HỒ SƠ A</th>
                <th>HỒ SƠ B</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(candidate => (
                <tr key={candidate.candidate_id}>
                  <td>#{candidate.candidate_id}</td>
                  <td>
                    <strong>{candidate.customer_1_name}</strong>
                    <div>{candidate.customer_1_phone}</div>
                  </td>
                  <td>
                    <strong>{candidate.customer_2_name}</strong>
                    <div>{candidate.customer_2_phone}</div>
                  </td>
                  <td>
                    <span className="status-pill">
                      {candidate.status === 'PENDING'
                        ? '● Chờ xử lý'
                        : candidate.status === 'MERGED'
                          ? '✓ Đã gộp'
                          : candidate.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-detail"
                      type="button"
                      onClick={() => setSelected(candidate)}
                    >
                      {candidate.status === 'PENDING'
                        ? 'So sánh và gộp →'
                        : 'Xem hồ sơ →'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>
  );
}
