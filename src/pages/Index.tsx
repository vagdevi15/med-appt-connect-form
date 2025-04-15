
import AppointmentForm from "@/components/AppointmentForm";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <AppointmentForm />
      </div>
    </div>
  );
};

export default Index;
