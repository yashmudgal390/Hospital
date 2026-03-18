export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="min-h-[500px] bg-gradient-to-r from-[#E0F2F1] to-[#F8FFFE]" />
      
      {/* Stats bar */}
      <div className="bg-[#0B7B8A] py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/20 rounded-xl" />
          ))}
        </div>
      </div>
      
      {/* Content blocks */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
