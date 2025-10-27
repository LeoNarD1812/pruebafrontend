const SuperAdminDashboardPage = () => {
  return (
    <div className="dashboard-page">
      <h1>Panel de Super Administración</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Usuarios</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Total Personas</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Eventos</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Sistema</h3>
          <p>Activo</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;

