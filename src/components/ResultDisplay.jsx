const ResultDisplay = ({ sequence, totalSeekDistance }) => {
    return (
        <div className="result-display">
            <h2>Kết quả</h2>

            <div className="result-details">
                <h3>Tổng khoảng cách di chuyển của đầu đọc/ghi:</h3>
                <p className="seek-distance">{totalSeekDistance} trục rãnh</p>

                <h3>Thứ tự truy cập các trục rãnh:</h3>
                <div className="sequence">
                    {sequence.map((position, index) => (
                        <span key={index} className="sequence-item">
                            {position}
                            {index < sequence.length - 1 && <span className="arrow">→</span>}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultDisplay;