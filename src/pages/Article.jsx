import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data';

const Article = ({ menuItems }) => {
  const { id } = useParams();
  const postId = parseInt(id, 10);
  const post = blogPosts.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold">Article non trouvé</h2>
          <p className="mt-4">L'article demandé n'existe pas.</p>
          <Link to="/blog" className="mt-4 inline-block text-purple-600">Retour au blog</Link>
        </div>
      </div>
    );
  }

  // Local overrides (keep in sync with Blog.jsx if you change them)
  const imageOverrides = {
    1: '/images/projets/Projet(P.A.M.F)/image1.jpg',
    2: '/images/projets/Formation_Arduino/formationArduino1.png',
    3: '/images/PROJET SERVEUR AUTOMATIQUE.mp4',
    4: '/images/projets/Projet(P.E.T.E)/eleve3.jpg'
  };

  const displayMedia = imageOverrides[post.id] || post.image;
  const isImage = typeof displayMedia === 'string' && /\.(png|jpe?g|svg|webp|gif)$/.test(displayMedia);
  const isVideo = typeof displayMedia === 'string' && /\.(mp4|webm|ogg)$/.test(displayMedia);
  const mediaSrc = typeof displayMedia === 'string' ? encodeURI(displayMedia) : displayMedia;

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        {isVideo ? (
          <div className="mb-6 w-full h-64 overflow-hidden rounded-lg">
            <video src={mediaSrc} className="object-cover w-full h-full" controls playsInline preload="metadata" />
          </div>
        ) : isImage ? (
          <div className="mb-6 w-full h-64 overflow-hidden rounded-lg">
            <img src={mediaSrc} alt={post.title} className="object-cover w-full h-full" />
          </div>
        ) : null}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mb-6 gap-4">
          <div className="flex items-center">
            <span className="font-semibold mr-2">{post.author}</span>
            <span className="text-sm">• {post.date} • {post.readTime}</span>
          </div>
        </div>

        <div className="prose max-w-none text-gray-700">
          {/* If post.content exists use it, otherwise fall back to excerpt */}
          {post.content ? (
            // If content is an array or string; allow simple markup
            typeof post.content === 'string' ? (
              post.content.split('\n').map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <div>{post.content}</div>
            )
          ) : (
            <p>{post.excerpt}</p>
          )}
        </div>

        <div className="mt-8">
          <Link to="/blog" className="text-purple-600 font-semibold">← Retour au blog</Link>
        </div>
      </div>
    </div>
  );
};

export default Article;
