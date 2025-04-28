const AlgorithmSelector = ({
    selectedAlgorithm,
    setSelectedAlgorithm,
    direction,
    setDirection,
    algorithms
}) => {
    return (
        <div className="algorithm-selector">
            <h2>Chọn thuật toán</h2>

            <div className="algorithm-options">
                {Object.entries(algorithms).map(([key, value]) => (
                    <div className="algorithm-option" key={key}>
                        <input
                            type="radio"
                            id={key}
                            name="algorithm"
                            value={key}
                            checked={selectedAlgorithm === key}
                            onChange={() => setSelectedAlgorithm(key)}
                        />
                        <label htmlFor={key}>{value.name}</label>
                    </div>
                ))}
            </div>

            {selectedAlgorithm === 'scan' && (
                <div className="direction-selector">
                    <h3>Chọn hướng ban đầu:</h3>
                    <div>
                        <input
                            type="radio"
                            id="up"
                            name="direction"
                            value="up"
                            checked={direction === 'up'}
                            onChange={() => setDirection('up')}
                        />
                        <label htmlFor="up">Tăng (từ 0 đến max)</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id="down"
                            name="direction"
                            value="down"
                            checked={direction === 'down'}
                            onChange={() => setDirection('down')}
                        />
                        <label htmlFor="down">Giảm (từ max đến 0)</label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlgorithmSelector;