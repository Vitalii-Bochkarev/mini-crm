function FieldErrorMessages({ id, messages = [] }) {
  if (messages.length === 0) return null;

  return (
    <ul
      id={id}
      style={{
        margin: "6px 0 0",
        paddingLeft: 20,
        color: "#fecaca",
        fontSize: 13,
      }}
    >
      {messages.map((message, index) => (
        <li key={`${index}-${message}`}>{message}</li>
      ))}
    </ul>
  );
}

export default FieldErrorMessages;
