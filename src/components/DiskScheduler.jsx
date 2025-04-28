import { useState } from 'react';
import InputForm from './InputForm';
import AlgorithmSelector from './AlgorithmSelector';
import VisualizationChart from './VisualizationChart';
import ResultDisplay from './ResultDisplay';
import { fcfs, sstf, scan, cscan, clook } from '../utils/algorithms';

const DiskScheduler = () => {
    const [queue, setQueue] = useState([]);
    const [initialPosition, setInitialPosition] = useState(53);
    const [diskSize, setDiskSize] = useState(200);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('fcfs');
    const [direction, setDirection] = useState('up');
    const [result, setResult] = useState(null);

    const algorithms = {
        fcfs: { name: 'First-Come, First-Served (FCFS)', fn: fcfs },
        sstf: { name: 'Shortest Seek Time First (SSTF)', fn: sstf },
        scan: { name: 'SCAN (Elevator)', fn: scan },
        cscan: { name: 'C-SCAN (Circular SCAN)', fn: cscan },
        clook: { name: 'C-LOOK', fn: clook },
    };

    const runAlgorithm = () => {
        const algo = algorithms[selectedAlgorithm];

        let result;
        if (selectedAlgorithm === 'scan') {
            result = algo.fn(queue, initialPosition, diskSize, direction);
        } else if (selectedAlgorithm === 'cscan' || selectedAlgorithm === 'clook') {
            result = algo.fn(queue, initialPosition, diskSize);
        } else {
            result = algo.fn(queue, initialPosition);
        }

        console.log("Algorithm result:", result); // Thêm dòng này để debug
        setResult(result);
    };

    return (
        <div className="disk-scheduler">
            <h1>Minh họa thuật toán lập lịch đĩa</h1>

            <InputForm
                queue={queue}
                setQueue={setQueue}
                initialPosition={initialPosition}
                setInitialPosition={setInitialPosition}
                diskSize={diskSize}
                setDiskSize={setDiskSize}
            />

            <AlgorithmSelector
                selectedAlgorithm={selectedAlgorithm}
                setSelectedAlgorithm={setSelectedAlgorithm}
                direction={direction}
                setDirection={setDirection}
                algorithms={algorithms}
            />

            <button
                className="run-button"
                onClick={runAlgorithm}
                disabled={queue.length === 0}
            >
                Chạy thuật toán
            </button>

            {result && (
                <>
                    <VisualizationChart
                        sequence={result.sequence}
                        diskSize={diskSize}
                        algorithmName={algorithms[selectedAlgorithm].name}
                        jumpPoints={result.jumpPoints || []} // Truyền jumpPoints nếu có
                    />
                    <ResultDisplay
                        sequence={result.sequence}
                        totalSeekDistance={result.totalSeekDistance}
                    />
                </>
            )}
        </div>
    );
};

export default DiskScheduler;