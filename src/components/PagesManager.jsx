import React, { useState } from 'react';
import EditPage from './EditPage';
import EditAccueil from './EditAccueil';
import EditAPropos from './EditAPropos';
import RenderContent from './RenderContent';
import EditServices from './EditServices';
import EditServicesItems from './EditServicesItems';
import EditServicesFull from './EditServicesFull';


const PagesManager = ({ menuItems = [], setMenuItems, services, setServices }) => {
    console.log("menuItems in PagesManager:", menuItems);
    const [editingPage, setEditingPage] = useState(null);
    const [viewPage, setViewPage] = useState(null);

    const isHtml = (str) => {
        if (!str || typeof str !== 'string') return false;
        return /<[^>]+>/.test(str);
    };

    const previewContent = (content, max = 120) => {
        if (!content) return <span className="text-gray-400">(sans contenu)</span>;
        if (typeof content === 'string') {
            return content.length > max ? content.slice(0, max) + '...' : content;
        }
        if (typeof content === 'object') {
            // structured content: prefer title, then first section body, then JSON
            if (content.title) return <span className="font-semibold">{content.title}</span>;
            if (Array.isArray(content.sections) && content.sections.length > 0) {
                const body = content.sections[0].body || '';
                return <RenderContent content={typeof body === 'string' ? (body.length > max ? body.slice(0, max) + '...' : body) : ''} />;
            }
            try {
                const str = JSON.stringify(content);
                return str.length > max ? str.slice(0, max) + '...' : str;
            } catch (e) {
                return <span className="text-gray-400">(contenu non affichable)</span>;
            }
        }
        return String(content);
    };

    const handleEditClick = (page) => {
        setEditingPage(page);
    };

    const handleSave = (id, newContent) => {
        setMenuItems(prevMenuItems =>
            prevMenuItems.map(item =>
                item.id === id ? { ...item, content: newContent } : item
            )
        );
        setEditingPage(null);
    };

    const handleCancel = () => {
        setEditingPage(null);
    };

    const handleViewClick = (page) => {
        setViewPage(page);
    };

    const handleViewClose = () => {
        setViewPage(null);
    };

    return (
    <div id="pages-manager" className="bg-white rounded-lg shadow-md p-4 md:p-8 mt-8">
            <h2 className="text-2xl font-bold mb-6">Gérer les pages</h2>
            {menuItems.length === 0 ? (
                <p>Aucune page à gérer.</p>
            ) : (
                <>
                    <div className="hidden md:block">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Page</th>
                                    <th className="py-3 px-6 text-left">Contenu</th>
                                    <th className="py-3 px-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {menuItems.map(page => (
                                    <tr key={page.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{page.label}</td>
                                        <td className="py-3 px-6 text-left">
                                            <div className="text-sm text-gray-700">{previewContent(page.content, 120)}</div>
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex item-center justify-center">
                                                <button onClick={() => handleViewClick(page)} title="Voir" className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleEditClick(page)} title="Modifier" className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button className="w-4 mr-2 transform hover:text-red-500 hover:scale-110" title="Supprimer">
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
                        {menuItems.map(page => (
                            <div key={page.id} className="border-b border-gray-200 mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold">{page.label}</div>
                                        <div className="text-sm text-gray-700 mt-2">{previewContent(page.content, 140)}</div>
                                    </div>
                                    <div className="flex item-center justify-end ml-4">
                                        <button onClick={() => handleViewClick(page)} className="w-8 h-8 mr-2 flex items-center justify-center rounded hover:bg-gray-100" title="Voir">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-blue-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleEditClick(page)} className="w-8 h-8 mr-2 flex items-center justify-center rounded hover:bg-gray-100" title="Modifier">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-purple-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {editingPage && (
                editingPage.id === 'accueil' ? (
                    <EditAccueil page={editingPage} onSave={handleSave} onCancel={handleCancel} />
                ) : editingPage.id === 'apropos' ? (
                    <EditAPropos page={editingPage} onSave={handleSave} onCancel={handleCancel} />
                ) : editingPage.id === 'services' ? (
                    // Open a unified editor for services (intro + items)
                    <EditServicesFull page={editingPage} onSave={handleSave} onCancel={handleCancel} services={services} setServices={setServices} />
                ) : (
                    <EditPage page={editingPage} onSave={handleSave} onCancel={handleCancel} />
                )
            )}

            {viewPage && (
                <div className="fixed inset-0 z-[9999] bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-start justify-center p-4 pt-24 md:pt-28">
                    <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-2xl mt-6 md:mt-0">
                        <h3 className="text-lg font-bold mb-4">{viewPage.label}</h3>
                        {viewPage.content && typeof viewPage.content === 'object' ? (
                            <div className="text-sm text-gray-800">
                                {viewPage.content.title && <h4 className="font-semibold mb-2">{viewPage.content.title}</h4>}
                                {viewPage.content.subtitle && <p className="mb-2 text-gray-700">{viewPage.content.subtitle}</p>}
                                {Array.isArray(viewPage.content.sections) && viewPage.content.sections.map((s, i) => (
                                    <div key={i} className="mb-3">
                                        {s.heading && <h5 className="font-medium">{s.heading}</h5>}
                                        <div className="text-gray-700"><RenderContent content={s.body} /></div>
                                    </div>
                                ))}
                                {Array.isArray(viewPage.content.stats) && (
                                    <div className="mt-3 flex gap-3">
                                        {viewPage.content.stats.map((st, i) => (
                                            <div key={i} className="bg-gray-100 p-2 rounded text-center">
                                                <div className="font-bold">{st.value}</div>
                                                <div className="text-xs text-gray-600">{st.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : isHtml(viewPage.content) ? (
                            <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: viewPage.content }} />
                        ) : (
                            <div className="text-sm text-gray-800 whitespace-pre-wrap">{viewPage.content || '(sans contenu)'}</div>
                        )}
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleViewClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagesManager;