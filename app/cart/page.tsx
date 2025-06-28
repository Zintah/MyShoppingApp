export default function Cart() {
  const cartItems = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 1, image: '🎧' },
    { id: 2, name: 'Smart Watch', price: 299.99, quantity: 2, image: '⌚' },
  ];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Shopping Cart
        </h1>
        <p className="text-xl text-gray-600">
          Review your items before checkout
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <a 
            href="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Cart Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex items-center">
                    <div className="text-4xl mr-4">{item.image}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded">
                        -
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity}</span>
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded">
                        +
                      </button>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button className="ml-4 text-red-600 hover:text-red-800">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$9.99</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(total + 9.99 + (total * 0.08)).toFixed(2)}</span>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-2">
                Proceed to Checkout
              </button>
              <a 
                href="/products"
                className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 