import { useState } from 'react';

const InputForm = ({
    queue,
    setQueue,
    initialPosition,
    setInitialPosition,
    diskSize,
    setDiskSize
}) => {
    const [queueInput, setQueueInput] = useState('');

    const handleQueueSubmit = (e) => {
        e.preventDefault();

        // Parse input string to array of numbers
        const parsedQueue = queueInput
            .split(',')
            .map(item => item.trim())
            .filter(item => !isNaN(parseInt(item)))
            .map(item => parseInt(item))
            .filter(num => num >= 0 && num < diskSize);

        setQueue(parsedQueue);
    };

    return (
        <div className="input-form">
            <h2>Thông số đầu vào</h2>

            <div className="form-group">
                <label>Kích thước đĩa (số trục rãnh tối đa):</label>
                <input
                    type="number"
                    value={diskSize}
                    onChange={(e) => setDiskSize(Math.max(1, parseInt(e.target.value) || 0))}
                    min="1"
                />
            </div>

            <div className="form-group">
                <label>Vị trí đầu đọc/ghi ban đầu:</label>
                <input
                    type="number"
                    value={initialPosition}
                    onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setInitialPosition(Math.max(0, Math.min(value, diskSize - 1)));
                    }}
                    min="0"
                    max={diskSize - 1}
                />
            </div>

            <form onSubmit={handleQueueSubmit}>
                <div className="form-group">
                    <label>Hàng đợi yêu cầu (các số ngăn cách bởi dấu phẩy):</label>
                    <input
                        type="text"
                        value={queueInput}
                        onChange={(e) => setQueueInput(e.target.value)}
                        placeholder="Ví dụ: 98, 183, 37, 122, 14, 124, 65, 67"
                    />
                </div>

                <button type="submit">Cập nhật hàng đợi</button>
            </form>

            {queue.length > 0 && (
                <div className="queue-display">
                    <h3>Hàng đợi hiện tại:</h3>
                    <p>{queue.join(', ')}</p>
                </div>
            )}
        </div>
    );
};

export default InputForm;