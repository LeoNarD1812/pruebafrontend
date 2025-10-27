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
    const location = useLocation(); // Hook para obtener la ruta actual
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

                // Expandir solo el PRIMER grupo
                const initiallyExpanded = {};
                if (menuItems.length > 0) {
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

    // Función para determinar si un item está activo
    const isItemActive = (itemPath) => {
        return location.pathname === itemPath;
    };

    // Función para determinar si un grupo tiene algún item activo
    const hasActiveItem = (group) => {
        if (!group.items) return false;
        return group.items.some(item => isItemActive(item.path));
    };

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

    // Efecto para expandir automáticamente el grupo que contiene la ruta activa
    useEffect(() => {
        if (menuData.length === 0) return;

        const newExpandedGroups = { ...expandedGroups };
        let foundActive = false;

        // Buscar el grupo que contiene la ruta activa
        menuData.forEach(group => {
            if (group.items && group.items.some(item => isItemActive(item.path))) {
                newExpandedGroups[group.id] = true;
                foundActive = true;
            } else {
                // Solo cerrar grupos si no es el inicial
                if (!expandedGroups[group.id]) {
                    newExpandedGroups[group.id] = false;
                }
            }
        });

        // Si no se encontró ningún item activo, mantener el estado actual
        if (foundActive) {
            setExpandedGroups(newExpandedGroups);
        }
    }, [location.pathname, menuData]);

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
                                            className={`nav-link nav-group-header ${hasActiveItem(group) ? 'group-active' : ''}`}
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
                                                            // Asegurar que solo este item esté activo
                                                            end // Esto asegura que la coincidencia sea exacta
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
                                        end // Esto asegura que la coincidencia sea exacta
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