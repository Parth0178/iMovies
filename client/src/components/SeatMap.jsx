// Renders the hall. Seat ids look like "A1" (row letter + number).
export default function SeatMap({ rows, seatsPerRow, booked, selected, onToggle }) {
  const letters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));
  const nums = Array.from({ length: seatsPerRow }, (_, i) => i + 1);

  return (
    <div className="seatmap">
      <div className="screen-bar">Screen</div>
      {letters.map((l) => (
        <div className="seat-row" key={l}>
          <span className="row-label">{l}</span>
          {nums.map((n) => {
            const id = `${l}${n}`;
            const taken = booked.includes(id);
            const chosen = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                disabled={taken}
                aria-label={`Seat ${id}${taken ? ', taken' : chosen ? ', selected' : ''}`}
                aria-pressed={chosen}
                className={`seat ${taken ? 'taken' : chosen ? 'chosen' : ''}`}
                onClick={() => onToggle(id)}
              >
                {n}
              </button>
            );
          })}
        </div>
      ))}
      <div className="seat-legend">
        <span><i className="seat" /> Available</span>
        <span><i className="seat chosen" /> Your pick</span>
        <span><i className="seat taken" /> Taken</span>
      </div>
    </div>
  );
}
