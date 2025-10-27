import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';

// Mapeo de iconos
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
    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        const loadMenu = async () => {
            if (!user) {
                setMenuData([]);
                setLoading(false);
                return;
            }

            try {
                const menuItems = await menuService.getMenuByUser(user.user);
                setMenuData(menuItems);

                // SOLUCIÓN: Expandir solo el PRIMER grupo
                const initiallyExpanded = {};
                if (menuItems.length > 0) {
                    // Solo expande el primer grupo que tenga items
                    const firstGroupWithItems = menuItems.find(group =>
                        group.items && group.items.length > 0
                    );
                    if (firstGroupWithItems) {
                        initiallyExpanded[firstGroupWithItems.id] = true;
                    }
                }
                setExpandedGroups(initiallyExpanded);
            } catch (error) {
                console.error('Error cargando menú:', error);
                setMenuData([]);
            } finally {
                setLoading(false);
            }
        };

        loadMenu();
    }, [user]);

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => {
            const newState = { ...prev };

            // Cerrar todos los demás grupos
            Object.keys(newState).forEach(key => {
                if (key !== groupId.toString()) {
                    newState[key] = false;
                }
            });

            // Alternar el grupo actual
            newState[groupId] = !prev[groupId];
            return newState;
        });
    };

    const getIconComponent = (iconName) => {
        if (!iconName) return <FaChartLine className="nav-icon" />;

        const cleanIconName = iconName.replace('fa-', '');
        const IconComponent = iconMap[iconName] || iconMap[cleanIconName] || FaChartLine;
        return <IconComponent className="nav-icon" />;
    };

    if (loading) {
        return (
            <aside className="sidebar">
                {/* <div className="cloud cloud-1"></div>
                <div className="cloud cloud-2"></div>
                <div className="cloud cloud-3"></div> */}

                <div className="sidebar-loading">
                    <FaSpinner className="spinner" />
                    <span>Cargando menú...</span>
                </div>
            </aside>
        );
    }

    return (
        <aside className="sidebar">
            {/* Nubes animadas - Desactivadas temporalmente */}
            {/* <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div> */}

            {/* Navegación */}
            <nav className="sidebar-nav">
                <ul>
                    {menuData.length === 0 ? (
                        <li>
                            <div className="nav-link" style={{ color: '#95a5a6', justifyContent: 'center' }}>
                                Sin accesos
                            </div>
                        </li>
                    ) : (
                        menuData.map((group) => (
                            <li key={group.id}>
                                {group.items && group.items.length > 0 ? (
                                    <div className="nav-group">
                                        <div
                                            className="nav-link nav-group-header"
                                            onClick={() => toggleGroup(group.id)}
                                            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {getIconComponent(group.icon)}
                                                <span>{group.name}</span>
                                            </div>
                                            {expandedGroups[group.id] ?
                                                <FaChevronDown size={12} /> :
                                                <FaChevronRight size={12} />
                                            }
                                        </div>
                                        {expandedGroups[group.id] && (
                                            <ul style={{ paddingLeft: '20px' }}>
                                                {group.items.map((item) => (
                                                    <li key={item.id}>
                                                        <NavLink
                                                            to={item.path}
                                                            className={({ isActive }) =>
                                                                isActive ? 'nav-link active' : 'nav-link'
                                                            }
                                                            style={{ paddingLeft: '40px' }}
                                                        >
                                                            {getIconComponent(item.icon)}
                                                            <span>{item.label}</span>
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        to={group.path}
                                        className={({ isActive }) =>
                                            isActive ? 'nav-link active' : 'nav-link'
                                        }
                                    >
                                        {getIconComponent(group.icon)}
                                        <span>{group.name}</span>
                                    </NavLink>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;