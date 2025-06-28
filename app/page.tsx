export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to My Shopping App
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Discover amazing products at great prices
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">Browse through thousands of products across various categories</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Get your orders delivered quickly and safely to your doorstep</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
            <p className="text-gray-600">Shop with confidence using our secure payment system</p>
          </div>
        </div>
        
        <div className="space-x-4">
          <a 
            href="/products" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
          >
            Shop Now
          </a>
          <a 
            href="/about" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition duration-200"
          >
            Learn More
          </a>
        </div>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Featured Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Electronics', 'Clothing', 'Home & Garden', 'Sports'].map((category) => (
            <div key={category} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold">{category}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 