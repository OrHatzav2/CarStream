import React from 'react'
import logo from '../assets/images/logo.png';
import {NavLink} from 'react-router-dom';
const Navbar = () => {
  const linkClass  = ({isActive}) => isActive ? 'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                   : 'text-white hover:bg-gray-800 hover:text-white rounded-md px-3 py-2'
  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-600 border-b relative overflow-hidden">
      <div
        className="w-72 h-72 bg-indigo-500 opacity-10 rounded-full absolute -bottom-60 -left-10 blur-4xl"
      ></div>
     
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div
            className="flex flex-1 items-center justify-center md:items-stretch md:justify-start"
          >
            <img
              className="h-10 w-auto filter invert"
              src={logo}
              alt="Logo"
            />
            <div className="md:ml-auto">
              <div className="flex space-x-2">
                <NavLink
                  to="/specific"
                  className={linkClass}
                  >נתון ספציפי</NavLink
                >
                <NavLink
                  to="/compare"
                  className={linkClass}
                  >השוואות נתונים</NavLink
                >
                <NavLink
                  to="/"
                  className={linkClass}
                  >כל המידע</NavLink
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar



{/* import React from 'react'
import logo from '../assets/images/logo.png';
import {NavLink} from 'react-router-dom';
const Navbar = () => {
  const linkClass  = ({isActive}) => isActive ? 'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                   : 'text-white hover:bg-gray-800 hover:text-white rounded-md px-3 py-2'
  return (
    <nav className="bg-indigo-700 border-b border-indigo-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div
            className="flex flex-1 items-center justify-center md:items-stretch md:justify-start"
          >
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
            <img
              className="h-10 w-auto filter invert"
              src={logo}
              alt="Logo"
            />
            </NavLink>
            <div className="md:ml-auto">
              <div className="flex space-x-2">
                <NavLink
                  to="/all"
                  className={linkClass}
                  >כל המידע</NavLink
                >
                <NavLink
                  to="/"
                  className={linkClass}
                  >בית</NavLink
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar
 */}