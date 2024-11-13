export const categories = {
  men: {
    title: "Men's Fashion",
    clothing: [
      {
        name: 'T-Shirts & Polos',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        subcategories: ['Round Neck', 'V-Neck', 'Polo', 'Henley']
      },
      {
        name: 'Shirts',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        subcategories: ['Casual', 'Formal', 'Denim', 'Party Wear']
      },
      {
        name: 'Pants',
        sizes: ['28', '30', '32', '34', '36', '38', '40'],
        subcategories: ['Casual', 'Formal', 'Joggers', 'Chinos']
      },
      {
        name: 'Jeans',
        sizes: ['28', '30', '32', '34', '36', '38', '40'],
        subcategories: ['Slim Fit', 'Regular Fit', 'Skinny', 'Straight']
      }
    ],
    accessories: [
      {
        name: 'Watches',
        brands: ['Fossil', 'Casio', 'Titan', 'Timex'],
        subcategories: ['Analog', 'Digital', 'Smart Watches']
      },
      {
        name: 'Belts',
        brands: ['Levis', 'Tommy Hilfiger', 'Calvin Klein'],
        subcategories: ['Leather', 'Synthetic', 'Reversible']
      }
    ]
  },
  women: {
    title: "Women's Fashion",
    clothing: [
      {
        name: 'Dresses',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        subcategories: ['Maxi', 'Mini', 'Midi', 'Party Wear']
      },
      {
        name: 'Tops',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        subcategories: ['Casual', 'Formal', 'Party Wear', 'Crop Tops']
      },
      {
        name: 'Ethnic Wear',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        subcategories: ['Sarees', 'Kurtas', 'Lehengas', 'Salwar Suits']
      }
    ],
    accessories: [
      {
        name: 'Makeup',
        brands: ['Maybelline', 'Lakme', 'MAC', 'NYX'],
        subcategories: [
          {
            name: 'Nail Polish',
            attributes: {
              colors: ['Red', 'Pink', 'Nude', 'Black', 'Blue'],
              finish: ['Matte', 'Glossy', 'Metallic']
            }
          },
          {
            name: 'Lipstick',
            attributes: {
              colors: ['Red', 'Pink', 'Nude', 'Brown', 'Coral'],
              finish: ['Matte', 'Creamy', 'Glossy']
            }
          }
        ]
      },
      {
        name: 'Jewelry',
        brands: ['Zaveri Pearls', 'Voylla', 'Accessorize'],
        subcategories: ['Earrings', 'Necklaces', 'Bracelets']
      }
    ]
  },
  kids: {
    title: "Kids' Fashion",
    clothing: [
      {
        name: 'Boys Clothing',
        sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y'],
        subcategories: ['T-Shirts', 'Shirts', 'Pants', 'Shorts']
      },
      {
        name: 'Girls Clothing',
        sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y'],
        subcategories: ['Dresses', 'Tops', 'Skirts', 'Pants']
      },
      {
        name: 'Baby Clothing',
        sizes: ['0-3M', '3-6M', '6-12M', '1-2Y'],
        subcategories: ['Bodysuits', 'Sets', 'Dresses', 'Sleepwear']
      }
    ],
    accessories: [
      {
        name: 'School Supplies',
        brands: ['American Tourister', 'Wildcraft', 'Disney'],
        subcategories: ['Backpacks', 'Lunch Boxes', 'Water Bottles']
      },
      {
        name: 'Footwear',
        brands: ['Nike', 'Adidas', 'Puma'],
        subcategories: ['Sneakers', 'Sandals', 'School Shoes']
      }
    ]
  },
  brands: {
    title: "Shop by Brand",
    featured: [
      {
        name: 'Nike',
        categories: ['Sports', 'Casual', 'Footwear'],
        subcategories: ['Men', 'Women', 'Kids']
      },
      {
        name: 'Adidas',
        categories: ['Sports', 'Casual', 'Footwear'],
        subcategories: ['Men', 'Women', 'Kids']
      },
      {
        name: 'Levis',
        categories: ['Denim', 'Casual', 'Accessories'],
        subcategories: ['Men', 'Women']
      },
      {
        name: 'Zara',
        categories: ['Fashion', 'Casual', 'Formal'],
        subcategories: ['Men', 'Women', 'Kids']
      },
      {
        name: 'H&M',
        categories: ['Fashion', 'Casual', 'Basics'],
        subcategories: ['Men', 'Women', 'Kids']
      }
    ],
    trending: [
      {
        name: 'MAC',
        categories: ['Makeup', 'Beauty'],
        subcategories: ['Face', 'Eyes', 'Lips']
      },
      {
        name: 'Fossil',
        categories: ['Watches', 'Accessories'],
        subcategories: ['Men', 'Women']
      }
    ]
  }
};