function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        border: '3px solid #e2e8f0', borderTopColor: '#3b82f6',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Spinner;