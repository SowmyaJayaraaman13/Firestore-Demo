import './App.css';
import EmployeeForm from '../src/components/employeeForm'
import EmployeeList from '../src/components/employeeList.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Switch>
        <Route path='/' exact><EmployeeForm/></Route>
        <Route path='/register-employee' component={EmployeeForm}></Route>
        <Route path='/employee-list'><EmployeeList/></Route>
      </Switch>
    </Router>

  );
}

export default App;

