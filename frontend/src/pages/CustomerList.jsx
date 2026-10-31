import { useCallback, useEffect, useRef, useState } from 'react';
import { customerApi } from '../api/customer.api';
import DataState from '../components/DataState';
import './CustomerList.css';
import DuplicateList from './DuplicateList';

const emptyForm = { full_name: '', phone: '', email: '', address: '' };
const menuItems = [
  { id: 'overview', icon: '▦', label: 'Tổng quan khách hàng' },
  { id: 'search', icon: '⌕', label: 'Tra cứu hồ sơ' },
  { id: 'create', icon: '♧', label: 'Tạo hồ sơ mới' },
  { id: 'duplicates', icon: '⇄', label: 'Hồ sơ nghi trùng' },
];
const phoneIsValid = value => /^0\d{9}$/.test(value);

export default function CustomerList({ user }) {
  const [activePage, setActivePage] = useState('overview');
  const [customers, setCustomers] = useState([]);
  const [phone, setPhone] = useState('');
  const [appliedPhone, setAppliedPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  // US4: Chỉnh sửa hồ sơ khách hàng
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const requestId = useRef(0);

  const loadCustomers = useCallback(async (search = '') => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);
    setAppliedPhone(search);
    try {
      const result = search
        ? await customerApi.findByPhone(search)
        : await customerApi.getAll();
      if (current !== requestId.current) return;
      setCustomers(Array.isArray(result) ? result : result ? [result] : []);
    } catch (err) {
      if (current !== requestId.current) return;
      setCustomers([]);
      if (!(search && err.message === 'Không tìm thấy dữ liệu.')) {
        setError(err.message);
      }
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Tải dữ liệu sau khi Effect đăng ký, tránh cập nhật State đồng bộ.
    Promise.resolve().then(() => {
      if (!cancelled) void loadCustomers();
    });

    return () => {
      cancelled = true;
      requestId.current += 1;
    };
  }, [loadCustomers]);

  function navigate(page) {
    setActivePage(page);
    closeDetail();
    setFormMessage('');
    setFormSuccess(false);
    if (page === 'overview' || page === 'search') {
      setPhone('');
      loadCustomers('');
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    const search = phone.trim();
    if (search && !phoneIsValid(search)) {
      ++requestId.current;
      setLoading(false);
      setError('Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.');
      setCustomers([]);
      return;
    }
    loadCustomers(search);
  }

  async function handleCreateCustomer(event) {
    event.preventDefault();
    setFormMessage('');
    setFormSuccess(false);
    const data = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      created_by: 1, // Nhân viên mẫu; thay bằng ID đăng nhập khi có xác thực
    };
    if (!data.full_name || !phoneIsValid(data.phone)) {
      setFormMessage('Vui lòng nhập họ tên và số điện thoại hợp lệ (10 chữ số, bắt đầu bằng 0).');
      return;
    }
    setSaving(true);
    try {
      await customerApi.create(data);
      setFormSuccess(true);
      setFormMessage('Đã tạo hồ sơ khách hàng thành công!');
      setForm({ ...emptyForm });
      await loadCustomers('');
    } catch (err) {
      setFormMessage(err.message.includes('409')
        ? 'Số điện thoại đã tồn tại. Vui lòng tra cứu trước khi tạo.'
        : `Không thể lưu hồ sơ: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function openDetail(customer) {
    setSelected(customer);
    setEditing(false);
    setEditError('');
    setEditMessage('');
  }

  function closeDetail() {
    setSelected(null);
    setEditing(false);
    setEditError('');
    setEditMessage('');
  }

  function startEdit() {
    if (!selected) return;
    setEditForm({
      full_name: selected.full_name || '',
      phone: selected.phone || '',
      email: selected.email || '',
      address: selected.address || '',
    });
    setEditError('');
    setEditMessage('');
    setEditing(true);
  }

  function onEditChange(event) {
    const { name, value } = event.target;
    setEditForm(old => ({ ...old, [name]: value }));
    setEditError('');
  }

  async function handleUpdateCustomer(event) {
    event.preventDefault();
    if (!selected) return;
    const data = {
      full_name: editForm.full_name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim() || null,
      address: editForm.address.trim() || null,
    };
    if (!data.full_name) return setEditError('Họ và tên không được để trống.');
    if (!phoneIsValid(data.phone)) {
      return setEditError('Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.');
    }
    setUpdating(true);
    setEditError('');
    setEditMessage('');
    try {
      const updated = await customerApi.update(selected.customer_id, data);
      setSelected(updated);
      setEditing(false);
      setEditMessage('Cập nhật hồ sơ thành công!');
      // Tải lại dữ liệu để bảng phản ánh thay đổi ngay.
      await loadCustomers('');
      setPhone('');
    } catch (err) {
      setEditError(err.message.includes('409')
        ? 'Số điện thoại đã thuộc một hồ sơ khác.'
        : `Không thể cập nhật: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  }

  const pageTitles = {
    overview: 'Tổng quan khách hàng', search: 'Tra cứu hồ sơ',
    create: 'Tạo hồ sơ mới', duplicates: 'Hồ sơ nghi trùng',
  };
  const activeCount = customers.filter(c => c.is_active === true).length;

  return (
    <div className="crm-layout">
      <aside className="crm-sidebar">
        <div className="crm-brand">
          <div className="brand-symbol">M</div>
          <div><strong>MEKONG MOBILE</strong><small>Smart CRM System</small></div>
        </div>
        <div className="sidebar-label">QUẢN LÝ HỆ THỐNG</div>
        <nav className="sidebar-nav" aria-label="Điều hướng CRM">
          {menuItems.map(item => (
            <button key={item.id} type="button"
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              aria-current={activePage === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}>
              <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-avatar">{user?.role === 'MANAGER' ? 'QL' : 'NV'}</div>
          <div>
            <strong>{user?.full_name || user?.username || 'Người dùng'}</strong>
            <small>{user?.role === 'MANAGER' ? 'Quản lý' : 'Nhân viên bán hàng'} · Luồng L1</small>
          </div>
        </div>
      </aside>

      <div className="crm-main">
        <header className="crm-topbar">
          <div className="breadcrumb">Hệ thống / Khách hàng / <b>{pageTitles[activePage]}</b></div>
          <span className="topbar-status">● Hệ thống quản lý khách hàng</span>
        </header>
        <div className="crm-content">
          {(activePage === 'overview' || activePage === 'search') && <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">CUSTOMER MANAGEMENT</div>
                <h1>{activePage === 'overview' ? 'Quản lý hồ sơ khách hàng' : 'Tra cứu hồ sơ khách hàng'}</h1>
                <p>Tra cứu, theo dõi và quản lý dữ liệu khách hàng tập trung.</p>
              </div>
              <span className="heading-badge">L1 · Mekong Mobile</span>
            </div>
            {activePage === 'overview' && <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon blue">♙</div><div>
                <p>Hồ sơ đang hiển thị</p><strong>{loading || error ? '—' : customers.length}</strong><small>Dữ liệu từ PostgreSQL</small>
              </div></div>
              <div className="stat-card"><div className="stat-icon green">✓</div><div>
                <p>Hồ sơ đang hoạt động</p><strong>{loading || error ? '—' : activeCount}</strong><small>Trong kết quả hiện tại</small>
              </div></div>
              <div className="stat-card"><div className="stat-icon purple">⌕</div><div>
                <p>Kết quả tra cứu</p><strong>{loading || error ? '—' : customers.length}</strong>
                <small>{appliedPhone ? 'Theo số điện thoại' : 'Danh sách hiện tại'}</small>
              </div></div>
            </div>}
            <section className="crm-panel">
              <div className="panel-heading"><div><h2>Tra cứu khách hàng</h2><p>Nhập số điện thoại để tìm hồ sơ khách hàng.</p></div></div>
              <form className="search-form" onSubmit={handleSearch}>
                <div className="search-field"><label htmlFor="customer-phone">SỐ ĐIỆN THOẠI</label>
                  <input id="customer-phone" type="tel" inputMode="numeric" maxLength={10}
                    placeholder="Ví dụ: 0901234567" value={phone} onChange={e => setPhone(e.target.value)}/>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>⌕ Tra cứu</button>
                <button className="btn-secondary" type="button" disabled={loading}
                  onClick={() => { setPhone(''); loadCustomers(''); }}>Xem tất cả</button>
              </form>
            </section>
            <section className="crm-panel">
              <div className="panel-heading"><div><h2>Danh sách hồ sơ khách hàng</h2>
                <p>Thông tin được lấy trực tiếp từ API của hệ thống.</p></div>
                <span className="record-count">{loading || error ? '—' : customers.length} hồ sơ</span>
              </div>
              <DataState loading={loading} error={error} empty={customers.length === 0}
                onRetry={() => loadCustomers(appliedPhone)}>
                <div className="table-scroll"><table className="customer-table"><thead><tr>
                  <th>KHÁCH HÀNG</th><th>SỐ ĐIỆN THOẠI</th><th>EMAIL</th><th>TRẠNG THÁI</th><th>THAO TÁC</th>
                </tr></thead><tbody>{customers.map(c => <tr key={c.customer_id}>
                  <td><div className="customer-name-cell"><div className="customer-avatar">{c.full_name?.charAt(0) || 'K'}</div>
                    <div><strong>{c.full_name}</strong><small>Mã KH: #{c.customer_id}</small></div></div></td>
                  <td>{c.phone}</td><td>{c.email || 'Chưa cập nhật'}</td>
                  <td><span className="status-pill">{c.is_active ? '● Đang hoạt động' : '● Ngừng hoạt động'}</span></td>
                  <td><button className="btn-detail" type="button" onClick={() => openDetail(c)}>Xem chi tiết →</button></td>
                </tr>)}</tbody></table></div>
              </DataState>
            </section>
          </>}

          {activePage === 'create' && <>
            <div className="page-heading"><div><div className="eyebrow">CUSTOMER REGISTRATION</div>
              <h1>Tạo hồ sơ khách hàng mới</h1><p>Thêm khách hàng vào cơ sở dữ liệu Mekong Mobile.</p></div>
              <span className="heading-badge">M2 · Tạo hồ sơ</span>
            </div>
            <section className="crm-panel"><div className="panel-heading"><div>
              <h2>Thông tin khách hàng</h2><p>Các trường có dấu * là bắt buộc.</p>
            </div></div>
              <form className="customer-create-form" onSubmit={handleCreateCustomer}>
                {[
                  ['full_name', 'Họ và tên *', 'text', 120],
                  ['phone', 'Số điện thoại *', 'tel', 10],
                  ['email', 'Email', 'email', 150],
                  ['address', 'Địa chỉ', 'text', 255],
                ].map(([name, label, type, maxLength]) => <div className="create-field" key={name}>
                  <label htmlFor={`create-${name}`}>{label}</label>
                  <input id={`create-${name}`} name={name} type={type} maxLength={maxLength}
                    required={name === 'full_name' || name === 'phone'} value={form[name]}
                    placeholder={`Nhập ${label.replace(' *', '').toLowerCase()}`}
                    onChange={e => { setForm(old => ({ ...old, [name]: e.target.value })); setFormMessage(''); }}/>
                </div>)}
                {formMessage && <p className={`form-message ${formSuccess ? 'success' : 'error'}`} role="status">{formMessage}</p>}
                <div className="form-actions">
                  <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu hồ sơ khách hàng'}</button>
                  <button className="btn-secondary" type="button" disabled={saving}
                    onClick={() => { setForm({ ...emptyForm }); setFormMessage(''); }}>Làm mới</button>
                </div>
              </form>
            </section>
            {formSuccess && <section className="crm-panel"><h2>Hồ sơ đã được tạo</h2>
              <p>Khách hàng đã được lưu. Em có thể xem trong danh sách.</p>
              <button type="button" className="btn-primary" onClick={() => navigate('overview')}>Xem danh sách khách hàng</button>
            </section>}
          </>}

          {activePage === 'duplicates' && <>
            <div className="page-heading"><div><div className="eyebrow">DUPLICATE MANAGEMENT</div>
              <h1>Quản lý hồ sơ nghi trùng</h1><p>Kiểm tra và hợp nhất hồ sơ khách hàng có khả năng trùng.</p></div>
              <span className="heading-badge">M3 · So sánh và gộp</span></div>
            {/* US5: Danh sách nghi trùng lấy từ PostgreSQL qua API */}
            <DuplicateList user={user} />
          </>}
          <footer className="crm-footer">Mekong Mobile Smart CRM · Chuyên đề Tốt nghiệp 1 · Track SE</footer>
        </div>
      </div>

      {selected && <div className="modal-backdrop" onMouseDown={event => {
        if (event.target === event.currentTarget && !updating) closeDetail();
      }}>
        <section className="detail-modal" role="dialog" aria-modal="true"
          aria-label={editing ? 'Chỉnh sửa khách hàng' : 'Chi tiết khách hàng'}>
          <div className="modal-heading"><div>
            <small>HỒ SƠ KHÁCH HÀNG</small>
            <h2>{editing ? 'Chỉnh sửa hồ sơ' : 'Thông tin chi tiết'}</h2>
          </div><button type="button" className="modal-close" disabled={updating}
            aria-label="Đóng" onClick={closeDetail}>✕</button></div>

          {!editing ? <>
            {editMessage && <p className="form-message success" role="status">{editMessage}</p>}
            {[
              ['Mã khách hàng', `#${selected.customer_id}`],
              ['Họ và tên', selected.full_name], ['Số điện thoại', selected.phone],
              ['Email', selected.email || 'Chưa có'], ['Địa chỉ', selected.address || 'Chưa có'],
              ['Trạng thái', selected.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động'],
            ].map(([label, value]) => <div className="detail-row" key={label}>
              <span>{label}</span><strong>{value}</strong>
            </div>)}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeDetail}>Đóng</button>
              <button type="button" className="btn-primary" onClick={startEdit}>✎ Chỉnh sửa hồ sơ</button>
            </div>
          </> : <form onSubmit={handleUpdateCustomer}>
            {[
              ['full_name', 'Họ và tên *', 'text', 120],
              ['phone', 'Số điện thoại *', 'tel', 10],
              ['email', 'Email', 'email', 150],
              ['address', 'Địa chỉ', 'text', 255],
            ].map(([name, label, type, maxLength]) => <div className="create-field edit-field" key={name}>
              <label htmlFor={`edit-${name}`}>{label}</label>
              <input id={`edit-${name}`} name={name} type={type} maxLength={maxLength}
                required={name === 'full_name' || name === 'phone'} value={editForm[name]}
                onChange={onEditChange} disabled={updating}/>
            </div>)}
            {editError && <p className="form-message error" role="alert">{editError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" disabled={updating}
                onClick={() => { setEditing(false); setEditError(''); }}>Hủy</button>
              <button type="submit" className="btn-primary" disabled={updating}>
                {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>}
        </section>
      </div>}
    </div>
  );
}
