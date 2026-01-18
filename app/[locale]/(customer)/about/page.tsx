export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About WDP Eyewear</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          WDP Eyewear is your trusted destination for premium eyewear solutions.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p>
          To provide high-quality eyewear that combines style, comfort, and functionality.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
        <ul>
          <li>Quality craftsmanship</li>
          <li>Customer satisfaction</li>
          <li>Innovation in design</li>
          <li>Sustainable practices</li>
        </ul>
      </div>
    </div>
  );
}
