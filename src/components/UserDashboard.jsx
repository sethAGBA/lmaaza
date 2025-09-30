import React from 'react';

const UserDashboard = () => {
    // Mock data for the current user
    const currentUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4 text-center md:text-left">Tableau de bord utilisateur</h1>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-8 max-w-md mx-auto">
                <div className="flex flex-col md:flex-row items-center mb-6 text-center md:text-left">
                    <div className="w-24 h-24 rounded-full bg-gray-300 mb-4 md:mb-0 md:mr-4 flex-shrink-0"></div>
                    <div>
                        <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                        <p className="text-gray-600">{currentUser.email}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">Bio</h3>
                    <p className="text-gray-700 text-sm">{currentUser.bio}</p>
                </div>
                <div className="mt-6 text-center md:text-left">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Modifier le profil
                    </button>
                </div>
            </div>
        </div>
    );
}
export default UserDashboard;