import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUsers,
    FaBuilding,
    FaGraduationCap,
    FaChartLine,
    FaCalendarAlt,
    FaUserCheck,
    FaChevronDown,
    FaChevronRight,
    FaCalendarDay,
    FaUsersCog,
    FaUserFriends,
    FaClipboardCheck,
    FaCog,
    FaUserShield,
    FaFileExcel,
    FaChartBar,
    FaUserTie,
    FaListAlt,
    FaUserPlus,
    FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { menuService } from '../services/menuService';
import './components.css';

const iconMap = {
    'fa-tachometer-alt': FaTachometerAlt,
    'fa-users': FaUsers,
    'fa-building': FaBuilding,
    'fa-university': FaGraduationCap,
    'fa-graduation-cap': FaGraduationCap,
    'fa-chart-line': FaChartLine,
    'fa-calendar-alt': FaCalendarAlt,
    'fa-user-check': FaUserCheck,
    'fa-calendar-day': FaCalendarDay,
    'fa-users-cog': FaUsersCog,
    'fa-user-friends': FaUserFriends,
    'fa-clipboard-check': FaClipboardCheck,
    'fa-cog': FaCog,
    'fa-user-shield': FaUserShield,
    'fa-file-excel': FaFileExcel,
    'fa-chart-bar': FaChartBar,
    'fa-user-tie': FaUserTie,
    'fa-list-alt': FaListAlt,
    'fa-user-plus': FaUserPlus,
    'fa-chart-pie': FaChartLine
};

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroup, setExpandedGroup] = useState(null);

    useEffect(() => {
        const loadMenu = async () => {
            if (!user) {
                setMenuData([]);
                setLoading(false);
                return;
            }

            try {
                const menuItems = await menuService.getMenuByUser(user.user);
                setMenuData(menuItems || []);

                // Find the active group based on current location
                const activeGroup = (menuItems || []).find(group => {
                    // Special handling for Dashboard if its path is directly active
                    if (group.name === 'Dashboard' && location.pathname.startsWith('/dashboard/admin')) {
                        return true;
                    }
                    // For other items/groups, check if their path or any sub-item's path is active
                    if (group.path && location.pathname.startsWith(group.path)) {
                        return true;
                    }
                    return group.items?.some(item => location.pathname.startsWith(item.path));
                });
                setExpandedGroup(activeGroup?.id || null); // Only expand if there's an active group

            } catch (error) {
                console.error('Error cargando menú:', error);
                setMenuData([]);
            } finally {
                setLoading(false);
            }
        };

        loadMenu();
    }, [user, location.pathname]);

    const toggleGroup = (groupId) => {
        setExpandedGroup(expandedGroup === groupId ? null : groupId);
    };

    const getIconComponent = (iconName) => {
        if (!iconName) return <FaChartLine />;
        const IconComponent = iconMap[iconName] || FaChartLine;
        return <IconComponent />;
    };

    if (loading) {
        return (
            <aside className="sidebar">
                <div className="sidebar-loading">
                    <FaSpinner className="spinner" />
                    <span>Cargando menú...</span>
                </div>
            </aside>
        );
    }

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                {(menuData || []).map((group) => (
                    <li key={group.id} className="sidebar-item">
                        {group.name === 'Dashboard' ? ( // Special handling for Dashboard
                            <NavLink to="/dashboard/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                                {getIconComponent(group.icon)}
                                <span>{group.name}</span>
                            </NavLink>
                        ) : group.items ? ( // Existing logic for groups
                            <>
                                <div onClick={() => toggleGroup(group.id)} className={`sidebar-group-header ${expandedGroup === group.id ? 'expanded' : ''}`}>
                                    <div>
                                        {getIconComponent(group.icon)}
                                        <span>{group.name}</span>
                                    </div>
                                    {expandedGroup === group.id ? <FaChevronDown /> : <FaChevronRight />}
                                </div>
                                {expandedGroup === group.id && (
                                    <ul className="sidebar-submenu">
                                        {group.items.map((item) => (
                                            <li key={item.id} className="sidebar-item">
                                                <NavLink to={item.path} className={({ isActive }) => (isActive ? 'active' : '')}>
                                                    {getIconComponent(item.icon)}
                                                    <span>{item.label}</span>
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : ( // Existing logic for direct links (non-Dashboard)
                            <NavLink to={group.path} className={({ isActive }) => (isActive ? 'active' : '')}>
                                {getIconComponent(group.icon)}
                                <span>{group.name}</span>
                            </NavLink>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;