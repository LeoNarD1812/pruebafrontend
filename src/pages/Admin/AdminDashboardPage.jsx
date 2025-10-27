const AdminDashboardPage = () => {
  return (
    <div className="dashboard-page">
      <h1>Panel de Administración</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Personas</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Eventos Activos</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Asistencias Hoy</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Matrículas</h3>
          <p>0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
