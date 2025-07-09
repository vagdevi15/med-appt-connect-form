import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const phoneNumber = "+918888876345";

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const locations = [
    { name: "Ameerpet: Lal Banglow", url: "https://www.google.com/maps/place/Wellness+Hospitals/@17.4365343,78.433657,15z/data=!4m6!3m5!1s0x3bcb90c90b99b145:0x6edf203a7bf420a8!8m2!3d17.4365343!4d78.4527114!16s%2Fg%2F11t2m569r4?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3D" },
    { name: "Ameerpet: DK Road", url: "https://www.google.com/maps/place/Wellness+Hospitals/@17.4370255,78.441789,15z/data=!4m6!3m5!1s0x3bcb90c7c38b8e17:0xede8e5b6de310471!8m2!3d17.4360762!4d78.4502234!16s%2Fg%2F11s2ysf37p?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3D" },
    { name: "Ameerpet: Shyamkaran Road", url: "https://www.google.com/maps/place/Wellness+Hospitals-+NXP+Medical+Center/@17.4375892,78.4530755,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb917cbe95511d:0x6e297b0711ed4b48!8m2!3d17.4375892!4d78.4530755!16s%2Fg%2F11vj3x20w4?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3D" },
    { name: "Hastinapuram", url: "https://www.google.com/maps/place/Wellness+Hospitals/@17.3266492,78.5371888,15z/data=!4m6!3m5!1s0x3bcba21ac9d4afb7:0x6d60f4b50e491577!8m2!3d17.3266492!4d78.5562432!16s%2Fg%2F11b7rxkk0w?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3D" },
    { name: "Sangareddy", url: "https://www.google.com/maps/place/Wellness+Hospitals+-+Sangareddy/@17.6114604,78.0406889,14z/data=!4m6!3m5!1s0x3bcbfb749bbf1525:0xa942ba039b8d3ca1!8m2!3d17.5888102!4d78.0808874!16s%2Fg%2F11vls9z6xp?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3D" },
    { name: "Kompally", url: "https://www.google.com/maps/place/Wellness+Hospitals+-+NXP+(Kompally)/@17.5109827,78.4612195,15z/data=!4m6!3m5!1s0x3bcb9bdc8c622799:0xd12990ce7d5a0a3b!8m2!3d17.5109827!4d78.4802739!16s%2Fg%2F11vptwqqdg?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3D" },
    { name: "Nizamabad", url: "https://maps.app.goo.gl/NVLw7XLKd1S8F5qW7" },
  ];

  return (
    <>
      {/* Top Bar with hospital label and locations */}
      <div className="bg-[#1f3061]  text-white py-2 px-4 flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="mb-2 h-500">
          <span className="bg-[#a64d79] mb-4 mt-4 text-white py-2 px-4 rounded-md inline-block text-xs font-semibold">
            🚨 ADVANCED SUPER SPECIALITY HOSPITALS
          </span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {locations.map((location, index) => (
            <a
              key={index}
              href={location.url}
              className="flex items-center gap-1 text-white text-sm hover:underline"
            >
              <MapPin size={14} />
              {location.name}
            </a>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/57ed3ded-aa5a-47fc-aafb-fe44dbfd2b3a.png" 
                alt="Wellness Hospitals Logo" 
                className="h-16 md:h-20"
              />
            </Link>
          </div>

          <nav className="hidden md:flex space-x-6 ml-80">
            <a href="https://wellnesshospitals.in/" className="text-wellness-darkGray hover:text-wellness-blue font-medium text-sm transition-colors">Home</a>
            <a href="https://wellnesshospitals.in/about-us/" className="text-wellness-darkGray hover:text-wellness-blue font-medium text-sm transition-colors">About Us</a>
            <a href="https://wellnesshospitals.in/specialities/" className="text-wellness-darkGray hover:text-wellness-blue font-medium text-sm transition-colors">Specialities</a>
            <a href="https://wellnesshospitals.in/consult-our-best-doctors/" className="text-wellness-darkGray hover:text-wellness-blue font-medium text-sm transition-colors">Consult Our Best Doctors</a>
          </nav>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 rounded-full border-wellness-blue text-wellness-blue hover:bg-wellness-blue hover:text-white transition-colors"
              onClick={handleCall}
            >
              <Phone size={16} />
              <span className="hidden sm:inline">Call Us</span>
            </Button>

            <Link to="/">
              <Button 
                size="sm" 
                className="rounded-full bg-wellness-blue hover:bg-blue-700 text-white transition-colors"
              >
                Book Appointment
              </Button>
            </Link>
          </div>

          <button className="md:hidden absolute top-4 right-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
