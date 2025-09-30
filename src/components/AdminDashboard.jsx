import React, { useState } from 'react';
import PagesManager from './PagesManager';
import EditAccueil from './EditAccueil';
import EditServicesItems from './EditServicesItems';
import EditServicesFull from './EditServicesFull';

const AdminDashboard = ({ menuItems, setMenuItems, services, setServices }) => {
    console.log('AdminDashboard menuItems:', menuItems);

    // Quick debug summary for pages manager
    const pagesSummary = Array.isArray(menuItems) ? `${menuItems.length} pages: ${menuItems.map(m => m.label).join(', ')}` : 'menuItems is not an array';

    // Find accueil page and its stats
    const accueil = Array.isArray(menuItems) ? menuItems.find(m => m.id === 'accueil') : null;
    const accueilContent = accueil && typeof accueil.content === 'object' ? accueil.content : null;
    const accueilStats = accueilContent && Array.isArray(accueilContent.stats) ? accueilContent.stats : [];

    // Mock data for users
    const users = [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'user' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user' },
        { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    ];

    // local state to open EditAccueil modal
    const [editingAccueil, setEditingAccueil] = useState(false);
        const [editingServices, setEditingServices] = useState(false);

    const handleSaveAccueil = (id, newContent) => {
        setMenuItems(prev => prev.map(item => item.id === id ? { ...item, content: newContent } : item));
        setEditingAccueil(false);
    };

    const servicesPage = Array.isArray(menuItems) ? menuItems.find(m => m.id === 'services') : null;

    const handleSaveServices = (id, newContent) => {
        // newContent is { title, intro } from EditServicesFull
        setMenuItems(prev => prev.map(item => item.id === id ? { ...item, content: newContent } : item));
        // services array is updated inside EditServicesFull via setServices prop
        setEditingServices(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Tableau de bord administrateur</h1>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
                <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-700">{pagesSummary}</div>
                {accueil && (
                    <div className="mb-4 p-4 bg-indigo-50 rounded">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-indigo-700">Accueil — Statistiques</div>
                                <div className="mt-2 flex gap-4">
                                    {accueilStats.length > 0 ? accueilStats.map((s, i) => (
                                        <div key={i} className="bg-white p-2 rounded shadow-sm text-center">
                                            <div className="text-lg font-bold text-gray-800">{s.value}</div>
                                            <div className="text-xs text-gray-600">{s.label}</div>
                                        </div>
                                    )) : <div className="text-sm text-gray-600">Aucune statistique définie.</div>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => document.getElementById('pages-manager')?.scrollIntoView({ behavior: 'smooth' })} className="bg-indigo-600 text-white px-3 py-2 rounded">Aller à Pages</button>
                                <button onClick={() => setEditingAccueil(true)} className="bg-indigo-700 text-white px-3 py-2 rounded">Modifier Accueil</button>
                                <button onClick={() => setEditingServices(true)} className="bg-indigo-500 text-white px-3 py-2 rounded">Modifier Services</button>
                            </div>
                        </div>
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-6">Utilisateurs</h2>
                <div className="hidden md:block">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Nom</th>
                                <th className="py-3 px-6 text-left">Email</th>
                                <th className="py-3 px-6 text-center">Rôle</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">{user.name}</td>
                                    <td className="py-3 px-6 text-left">{user.email}</td>
                                    <td className="py-3 px-6 text-center">{user.role}</td>
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex item-center justify-center">
                                            <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="md:hidden">
                    {users.map(user => (
                        <div key={user.id} className="border-b border-gray-200 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold">{user.name}</span>
                                <span className="text-sm text-gray-600">{user.role}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{user.email}</div>
                            <div className="flex item-center justify-end">
                                <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <PagesManager menuItems={menuItems} setMenuItems={setMenuItems} services={services} setServices={setServices} />
            {editingAccueil && accueil && (
                <EditAccueil page={accueil} onSave={handleSaveAccueil} onCancel={() => setEditingAccueil(false)} />
            )}
            {editingServices && servicesPage && (
                <EditServicesFull page={servicesPage} onSave={handleSaveServices} onCancel={() => setEditingServices(false)} services={services} setServices={setServices} />
            )}
        </div>
    );
};

export default AdminDashboard;