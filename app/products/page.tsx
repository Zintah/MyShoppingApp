export default function Products() {
  const products = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, image: '🎧' },
    { id: 2, name: 'Smart Watch', price: 299.99, image: '⌚' },
    { id: 3, name: 'Laptop', price: 1299.99, image: '💻' },
    { id: 4, name: 'Smartphone', price: 799.99, image: '📱' },
    { id: 5, name: 'Gaming Console', price: 499.99, image: '🎮' },
    { id: 6, name: 'Tablet', price: 599.99, image: '📋' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Our Products
        </h1>
        <p className="text-xl text-gray-600">
          Find the perfect products for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
            <div className="p-6">
              <div className="text-6xl text-center mb-4">{product.image}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-2xl font-bold text-blue-600 mb-4">${product.price}</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition duration-200">
          Load More Products
        </button>
      </div>
    </div>
  )
} 