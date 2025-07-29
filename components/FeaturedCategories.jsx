// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Loader } from 'lucide-react';
// import '../styles/components/featured-categories.scss';

// const FeaturedCategories = () => {
//   const [banners, setBanners] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetchBanners();
//   }, []);

//   const fetchBanners = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch('/api/banners?position=featured');
//       if (!response.ok) throw new Error('Failed to fetch featured banners');
//       const data = await response.json();
//       setBanners(data);
//     } catch (error) {
//       // Fallback categories for development
//       setBanners([
//         {
//           id: 'summer',
//           title: 'Summer Collection',
//           image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80',
//           link: '/women/summer-collection'
//         },
//         {
//           id: 'mens',
//           title: 'Mens Wear',
//           image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&q=80',
//           link: '/men'
//         },
//         {
//           id: 'womens',
//           title: 'Womens Wear',
//           image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80',
//           link: '/women'
//         },
//         {
//           id: 'accessories',
//           title: 'Accessories',
//           image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&q=80',
//           link: 'unisex/Accessories'
//         }
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="categories-loading">
//         <Loader className="spinner" />
//         <p>Loading categories...</p>
//       </div>
//     );
//   }

//   if (banners.length === 0) return null;

//   return (
//     <div className="featured-categories">
//       <div className="container">
//         <h2>Shop By Category</h2>
//         <div className="categories-grid">
//           {banners.map((banner) => (
//             <Link 
//               to={banner.link} 
//               key={banner.id} 
//               className="category-card"
//             >
//               <div className="category-image">
//                 <img src={banner.image} alt={banner.title} />
//               </div>
//               <h3>{banner.title}</h3>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeaturedCategories;