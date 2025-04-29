import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const VisualizationChart = ({ sequence, diskSize, algorithmName, jumpPoints = [] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');

        // Tìm các giá trị độc nhất từ sequence và sắp xếp để hiển thị trên trục X
        const uniquePositions = [...new Set(sequence)].sort((a, b) => a - b);

        // Thêm vị trí 0 và diskSize-1 nếu chưa có
        if (!uniquePositions.includes(0)) uniquePositions.unshift(0);
        if (!uniquePositions.includes(diskSize - 1)) uniquePositions.push(diskSize - 1);

        // Tạo các dataset cho biểu đồ - đảo ngược x và y
        let datasets = [];

        if (jumpPoints && jumpPoints.length > 0) {
            // Tạo dataset riêng cho từng đoạn của đường đi
            const normalSegmentsData = [];
            const jumpSegmentsData = [];

            // Xử lý từng đoạn trong sequence dựa trên jumpPoints
            let lastSegmentEnd = 0;

            // Xử lý các jumpPoints
            for (const jump of jumpPoints) {
                // Thêm đoạn đường thông thường trước điểm nhảy
                if (jump.from > lastSegmentEnd) {
                    const normalSegment = {
                        label: 'Đường di chuyển thông thường',
                        data: sequence.slice(lastSegmentEnd, jump.from + 1).map((value, index) => ({
                            y: lastSegmentEnd + index, // Thứ tự thực hiện trên trục Y
                            x: value,              // Vị trí trục rãnh trên trục X
                            position: value        // Lưu giá trị vị trí để hiển thị
                        })),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgb(75, 192, 192)',
                        pointRadius: 6,
                        borderWidth: 2,
                        tension: 0.1,
                        showLine: true
                    };
                    normalSegmentsData.push(normalSegment);
                }

                // Thêm đoạn nhảy (nét đứt)
                const jumpSegment = {
                    label: 'Đoạn nhảy không tính quãng đường',
                    data: [
                        { y: jump.from, x: sequence[jump.from], position: sequence[jump.from] },
                        { y: jump.to, x: sequence[jump.to], position: sequence[jump.to] }
                    ],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderDash: [5, 5],
                    pointRadius: 6,
                    borderWidth: 2,
                    tension: 0.1,
                    showLine: true
                };
                jumpSegmentsData.push(jumpSegment);

                lastSegmentEnd = jump.to;
            }

            // Thêm phần cuối cùng nếu còn
            if (lastSegmentEnd < sequence.length - 1) {
                const finalSegment = {
                    label: 'Đường di chuyển thông thường',
                    data: sequence.slice(lastSegmentEnd).map((value, index) => ({
                        y: lastSegmentEnd + index,
                        x: value,
                        position: value
                    })),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgb(75, 192, 192)',
                    pointRadius: 6,
                    borderWidth: 2,
                    tension: 0.1,
                    showLine: true
                };
                normalSegmentsData.push(finalSegment);
            }

            // Gộp tất cả các đoạn vào datasets
            datasets = [...normalSegmentsData, ...jumpSegmentsData];
        } else {
            // Trường hợp không có jumpPoints
            datasets = [
                {
                    label: 'Vị trí trục rãnh',
                    data: sequence.map((value, index) => ({
                        y: index,
                        x: value,
                        position: value
                    })),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgb(75, 192, 192)',
                    pointRadius: 6,
                    borderWidth: 2,
                    tension: 0.1,
                    showLine: true
                }
            ];
        }

        // Tạo Chart với loại 'scatter' để có thể điều khiển từng điểm dữ liệu
        chartInstance.current = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Vị trí trục rãnh',
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        },
                        min: -5, // Thêm khoảng trống bên trái
                        max: diskSize + 5, // Thêm khoảng trống bên phải
                        grid: {
                            display: true,
                            color: '#ddd'
                        },
                        ticks: {
                            stepSize: Math.ceil(diskSize / 20), // Số bước chia trục X
                            font: {
                                size: 12
                            },
                            color: '#333',
                            // Hiển thị các vị trí trục rãnh quan trọng
                            callback: function (value) {
                                if (uniquePositions.includes(Math.round(value))) {
                                    return Math.round(value);
                                }
                                if (Math.round(value) % Math.ceil(diskSize / 10) === 0) {
                                    return Math.round(value);
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Thứ tự thực hiện',
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        },
                        min: -0.5,
                        max: sequence.length - 0.5,
                        grid: {
                            display: true,
                            color: '#ddd'
                        },
                        ticks: {
                            stepSize: 1,
                            precision: 0,
                            font: {
                                size: 12
                            },
                            color: '#333'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: jumpPoints && jumpPoints.length > 0,
                        position: 'top',
                        labels: {
                            font: {
                                size: 12
                            },
                            filter: function (legendItem, chartData) {
                                if (legendItem.text === 'Đường di chuyển thông thường') {
                                    return !chartData.datasets.slice(0, legendItem.datasetIndex).some(
                                        dataset => dataset.label === 'Đường di chuyển thông thường'
                                    );
                                }
                                if (legendItem.text === 'Đoạn nhảy không tính quãng đường') {
                                    return !chartData.datasets.slice(0, legendItem.datasetIndex).some(
                                        dataset => dataset.label === 'Đoạn nhảy không tính quãng đường'
                                    );
                                }
                                return true;
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        callbacks: {
                            title: function (context) {
                                return `Bước ${context[0].parsed.y}`;
                            },
                            label: function (context) {
                                return `Vị trí trục rãnh: ${context.parsed.x}`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `Biểu đồ minh họa thuật toán ${algorithmName}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: { top: 10, bottom: 20 }
                    },
                    annotation: {
                        annotations: uniquePositions.map(pos => ({
                            type: 'line',
                            xMin: pos,
                            xMax: pos,
                            borderColor: 'rgba(150, 150, 150, 0.3)',
                            borderWidth: 1,
                            borderDash: [3, 3],
                            label: {
                                enabled: false
                            }
                        }))
                    }
                },
                elements: {
                    line: {
                        tension: 0.2
                    },
                    point: {
                        radius: 5,
                        hitRadius: 10,
                        hoverRadius: 7
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuad'
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 20,
                        top: 20,
                        bottom: 10
                    }
                }
            },
            plugins: [{
                afterDraw: function (chart) {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach(function (dataset, datasetIndex) {
                        const meta = chart.getDatasetMeta(datasetIndex);
                        if (!meta.hidden) {
                            meta.data.forEach(function (element, index) {
                                // Đặt định dạng cho nhãn
                                ctx.fillStyle = 'black';
                                ctx.font = '11px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';

                                // Lấy giá trị vị trí và vẽ nhãn
                                const position = dataset.data[index].position;
                                ctx.fillText(position, element.x, element.y - 10);
                            });
                        }
                    });
                }
            }]
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [sequence, diskSize, algorithmName, jumpPoints]);

    return (
        <div className="chart-container" style={{
            height: '400px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default VisualizationChart;