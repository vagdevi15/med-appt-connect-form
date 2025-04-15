
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavLinkProps {
  href: string;
  label: string;
  external?: boolean;
}

const NavLink = ({ href, label, external = true }: NavLinkProps) => {
  if (external) {
    return (
      <a 
        href={href} 
        className="text-wellness-darkGray hover:text-wellness-blue font-medium text-sm transition-colors"
        target="_blank" 
        rel="noopener noreferrer"
      >
        {label}
      </a>
    );
  }
  
  return (
    <Link to={href} className="text-wellness-darkGray hover:text-wellness-blue font-medium text-sm transition-colors">
      {label}
    </Link>
  );
};

const Header = () => {
  const phoneNumber = "+918888876345";
  
  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };
  
  return (
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
        
        <nav className="hidden md:flex space-x-6">
          <NavLink href="https://wellnesshospitals.in/" label="Home" />
          <NavLink href="https://wellnesshospitals.in/about-us/" label="About Us" />
          <NavLink href="https://wellnesshospitals.in/specialities/" label="Specialities" />
          <NavLink href="https://wellnesshospitals.in/consult-our-best-doctors/" label="Consult Our Best Doctors" />
          {/* <NavLink href="#" label="Patient Info" />
          <NavLink href="#" label="Insurance" />
          <NavLink href="#" label="Blogs" />
          <NavLink href="#" label="Visit NXP Centers" /> */}
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
  );
};

export default Header;
