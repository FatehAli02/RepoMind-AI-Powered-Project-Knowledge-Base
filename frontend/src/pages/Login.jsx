export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Login to RepoMind</h2>
        
        {/* Username Input */}
        <input 
          type="text" 
          placeholder="Username" 
          className="border p-2 rounded"
        />
        
        {/* Password Input */}
        <input 
          type="password" 
          placeholder="Password" 
          className="border p-2 rounded"
        />
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}