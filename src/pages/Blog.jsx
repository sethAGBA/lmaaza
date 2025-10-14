import React, { useState } from 'react';
import RenderContent from '../components/RenderContent';
import { ArrowRight, Calendar, Clock, User, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data';
import SEO from '../components/SEO';

const Blog = ({ menuItems }) => {
  const blogPage = menuItems.find(item => item.id === 'blog');
  const [modalVideo, setModalVideo] = useState(null);

  // Local overrides to reuse images without editing src/data.js
  const imageOverrides = {
    1: '/images/projets/Projet(P.A.M.F)/image1.jpg',
    2: '/images/projets/Formation_Arduino/formationArduino1.png',
    // Use video for the 'Serveur Automatique' post (id:3)
    3: '/images/PROJET_SERVEUR_AUTOMATIQUE.mp4',
    // For "L'Importance de l'Éducation Technologique pour les Filles" use eleve3
    4: '/images/projets/Projet(P.E.T.E)/eleve3.jpg'
  };

  return (
    <>
      <SEO 
        title="Blog - Actualités et Innovations Technologiques | L'Maaza"
        description="Découvrez les dernières actualités technologiques, innovations et projets de L'Maaza. Articles sur l'agriculture, la santé, l'éducation et l'environnement au Togo."
        keywords="blog technologique, innovation, agriculture, santé, éducation, environnement, Togo, Arduino, formation, L'Maaza, actualités"
        canonical="https://lmaaza.net/blog"
      />
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Notre Blog</h2>
            <div className="text-xl text-gray-600">
              {blogPage ? <RenderContent content={blogPage.content} /> : "Chargement du contenu..."}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => {
              const displayImage = imageOverrides[post.id] || post.image;
              const isImagePath = typeof displayImage === 'string' && /\.(png|jpe?g|svg|webp|gif)$/.test(displayImage);
              const isVideoPath = typeof displayImage === 'string' && /\.(mp4|webm|ogg)$/.test(displayImage);
              const mediaSrc = displayImage;
              return (
                <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                  <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden relative">
                    {isVideoPath ? (
                      <div className="relative w-full h-full">
                        <img src="/images/video-poster.jpg" alt="Video thumbnail" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                          <button 
                            onClick={() => setModalVideo(mediaSrc)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                          >
                            <Video className="w-5 h-5" />
                            Voir la vidéo
                          </button>
                        </div>
                      </div>
                    ) : isImagePath ? (
                      <img src={mediaSrc} alt={post.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-6xl text-gray-400">{displayImage}</div>
                    )}
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center mb-3">
                      <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">{post.date}</span>
                      </div>
                      <Link to={`/blog/${post.id}`} className="text-purple-600 hover:text-purple-800 font-semibold flex items-center">
                        Lire la suite
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Restez Informé</h3>
              <p className="text-gray-600 mb-6">
                Abonnez-vous à notre newsletter pour recevoir les derniers articles et actualités technologiques.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Votre adresse email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setModalVideo(null)}
        >
          <div 
            className="relative bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setModalVideo(null)}
              className="absolute top-3 right-3 bg-gray-800 text-white rounded-full p-2 z-10 hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <video 
              src={modalVideo} 
              className="w-full h-auto max-h-[80vh]" 
              controls 
              autoPlay 
              playsInline
              preload="metadata"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>
      )}
    </>
  );
};

export default Blog;