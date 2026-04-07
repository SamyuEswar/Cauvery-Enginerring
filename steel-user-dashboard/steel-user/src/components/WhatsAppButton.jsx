const WhatsAppButton = () => {
  const phoneNumber = "your phone number";

  const message = "Hello, I am interested in your fabrication services";

  const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
      }}
    >
      <img
        src="/whatsapp.png"
        alt="WhatsApp"
        style={{ width: "60px", height: "60px" }}
      />
    </a>
  );
};

export default WhatsAppButton;