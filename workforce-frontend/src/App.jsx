import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import HRDashboard from './pages/hr/HRDashboard';
import Employees from './pages/hr/Employees';
import Departments from './pages/hr/Departments';
import Payroll from './pages/hr/Payroll';
import ITDashboard from './pages/it/ITDashboard';
import AssetInventory from './pages/it/AssetInventory';
import Assignments from './pages/it/Assignments';
import ITTickets from './pages/it/ITTickets';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import SalaryPay from './pages/employee/SalaryPay';
import MyAssets from './pages/employee/MyAssets';
import MyTickets from './pages/employee/MyTickets';
import ChangePassword from './pages/ChangePassword';
import Leave from './pages/employee/Leave';
import LeaveManagement from './pages/hr/LeaveManagement';
import ITMyProfile from './pages/it/MyProfile';
import ITMySalary from './pages/it/MySalary';
import ITMyLeave from './pages/it/MyLeave';
import { ToastProvider } from './context/ToastContext';
import HRMyProfile from './pages/hr/MyProfile';
import HRMySalary from './pages/hr/MySalary';
function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/hr-dashboard" element={<HRDashboard />} />
          <Route path="/hr/employees" element={<Employees />} />
          <Route path="/hr/departments" element={<Departments />} />
          <Route path="/hr/payroll" element={<Payroll />} />
          <Route path="/hr/leave" element={<LeaveManagement />} />
          <Route path="/hr/my-profile" element={<HRMyProfile />} />
          <Route path="/hr/my-salary" element={<HRMySalary />} /> 
          
          <Route path="/it-dashboard" element={<ITDashboard />} />
          <Route path="/it/assets" element={<AssetInventory />} />
          <Route path="/it/assignments" element={<Assignments />} />
          <Route path="/it/tickets" element={<ITTickets />} />
          <Route path="/it/my-profile" element={<ITMyProfile />} />
          <Route path="/it/my-salary" element={<ITMySalary />} />
          <Route path="/it/my-leave" element={<ITMyLeave />} />

          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<MyProfile />} />
          <Route path="/employee/salary" element={<SalaryPay />} />
          <Route path="/employee/assets" element={<MyAssets />} />
          <Route path="/employee/tickets" element={<MyTickets />} />
          <Route path="/employee/leave" element={<Leave />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;