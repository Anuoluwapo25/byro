import EventCreationForm from "../../../components/events/EventCreationForm";

export default function CreateEventPage() {
  return (
    <div className="bg-main-section bg-fixed bg-cover bg-center bg-no-repeat min-h-screen">
      <div className=" p-6">
        <div className="flex items-center gap-4 mb-6">
          <EventCreationForm />
        </div>
      </div>
    </div>
  );
}
