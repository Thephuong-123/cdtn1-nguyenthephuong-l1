
export default function DataState({
  loading = false,
  error = null,
  empty = false,
  onRetry,
  children,
}) {
  if (loading) {
    return (
      <div role="status" style={styles.box}>
        <p>Đang tải dữ liệu khách hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" style={styles.box}>
        <p>Không thể tải dữ liệu: {error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Thử lại
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div style={styles.box}>
        <p>Không có dữ liệu để hiển thị.</p>
      </div>
    );
  }

  return <>{children}</>;
}

const styles = {
  box: {
    padding: '24px',
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginTop: '16px',
  },
};
