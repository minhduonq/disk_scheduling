export const fcfs = (queue, initialPosition) => {
    const sequence = [initialPosition];
    let totalSeekDistance = 0;
    let currentPosition = initialPosition;

    for (const position of queue) {
        sequence.push(position);
        totalSeekDistance += Math.abs(position - currentPosition);
        currentPosition = position;
    }

    return { sequence, totalSeekDistance };
};


export const sstf = (queue, initialPosition) => {
    const sequence = [initialPosition];
    let totalSeekDistance = 0;
    let currentPosition = initialPosition;
    const remainingRequests = [...queue];

    while (remainingRequests.length > 0) {
        //Tìm request có khoảng cách seek ngắn nhất
        let shortestSeekIndex = 0; //Vị trí của request có khoảng cách seek ngắn nhất
        let shortestSeekDistance = Math.abs(remainingRequests[0] - currentPosition);

        for (let i = 1; i < remainingRequests.length; i++) {
            const distance = Math.abs(remainingRequests[i] - currentPosition);
            if (distance < shortestSeekDistance) {
                shortestSeekDistance = distance;
                shortestSeekIndex = i;
            }
        }

        const nextPosition = remainingRequests[shortestSeekIndex];
        sequence.push(nextPosition);
        totalSeekDistance += shortestSeekDistance;
        currentPosition = nextPosition;

        //Xoá request đã được phục vụ khỏi danh sách remainingRequests tại vị trí shortestSeekIndex
        remainingRequests.splice(shortestSeekIndex, 1);
    }

    return { sequence, totalSeekDistance };
};


export const scan = (queue, initialPosition, diskSize, initialDirection = 'up') => {
    const sequence = [initialPosition];
    let totalSeekDistance = 0;
    let currentPosition = initialPosition;

    // Split requests into those greater and less than the current position
    const sortedQueue = [...queue].sort((a, b) => a - b);
    const greaterRequests = sortedQueue.filter(pos => pos > initialPosition);
    const lesserRequests = sortedQueue.filter(pos => pos < initialPosition);

    // Xử lý theo hướng di chuyển ban đầu
    if (initialDirection === 'up') {
        // Xử lý tất cả các request lớn hơn vị trí hiện tại
        for (const position of greaterRequests) {
            sequence.push(position);
            totalSeekDistance += Math.abs(position - currentPosition);
            currentPosition = position;
        }

        // Di chuyển đến cuối đĩa
        if (greaterRequests.length > 0) {
            sequence.push(diskSize - 1);
            totalSeekDistance += Math.abs(diskSize - 1 - currentPosition);
            currentPosition = diskSize - 1;
        }

        // Di chuyển đến tất cả các request nhỏ hơn vị trí hiện tại
        for (const position of lesserRequests.reverse()) {
            sequence.push(position);
            totalSeekDistance += Math.abs(position - currentPosition);
            currentPosition = position;
        }
    } else {
        // Xử lý tất cả các request nhỏ hơn vị trí hiện tại
        for (const position of lesserRequests.reverse()) {
            sequence.push(position);
            totalSeekDistance += Math.abs(position - currentPosition);
            currentPosition = position;
        }

        if (lesserRequests.length > 0) {
            sequence.push(0);
            totalSeekDistance += Math.abs(currentPosition - 0);
            currentPosition = 0;
        }

        // Xử lý tất cả các request lớn hơn vị trí hiện tại
        for (const position of greaterRequests) {
            sequence.push(position);
            totalSeekDistance += Math.abs(position - currentPosition);
            currentPosition = position;
        }
    }

    return { sequence, totalSeekDistance };
};


export const cscan = (queue, initialPosition, diskSize) => {
    const sequence = [initialPosition];
    let totalSeekDistance = 0;
    let currentPosition = initialPosition;
    const jumpPoints = []; // Mảng lưu các điểm nhảy

    // Sort các yêu cầu và chia thành các yêu cầu lớn hơn và nhỏ hơn vị trí hiện tại
    const sortedQueue = [...queue].sort((a, b) => a - b);
    const greaterRequests = sortedQueue.filter(pos => pos > initialPosition);
    const lesserRequests = sortedQueue.filter(pos => pos < initialPosition);

    // Xử lý tất cả các yêu cầu lớn hơn vị trí hiện tại
    for (const position of greaterRequests) {
        sequence.push(position);
        totalSeekDistance += Math.abs(position - currentPosition);
        currentPosition = position;
    }

    // Nếu không còn yêu cầu nào lớn hơn, di chuyển đến cuối đĩa
    // Sau đó quay lại đầu đĩa (không tính thời gian seek cho bước nhảy trong C-SCAN)
    if (lesserRequests.length > 0) {
        // Di chuyển đến cuối đĩa
        sequence.push(diskSize - 1);
        totalSeekDistance += Math.abs(diskSize - 1 - currentPosition);

        // Lưu vị trí nhảy từ cuối đĩa về đầu đĩa
        jumpPoints.push({
            from: sequence.length - 1, // Vị trí cuối đĩa trong sequence
            to: sequence.length // Vị trí đầu đĩa sẽ là phần tử tiếp theo
        });

        // Di chuyển đến đầu đĩa (track 0)
        sequence.push(0);
        currentPosition = 0;

        // Xử lý tất cả các yêu cầu nhỏ hơn vị trí hiện tại
        for (const position of lesserRequests) {
            sequence.push(position);
            totalSeekDistance += Math.abs(position - currentPosition);
            currentPosition = position;
        }
    }

    return { sequence, totalSeekDistance, jumpPoints };
};

export const look = (queue, initialPosition, diskSize, initialDirection = 'up') => {
    const sequence = [initialPosition];
    let totalSeekDistance = 0;
    let currentPosition = initialPosition;
    const jumpPoints = []; // Mảng lưu các điểm nhảy nếu cần

    // Phân tách các yêu cầu thành các yêu cầu lớn hơn và nhỏ hơn vị trí hiện tại
    const sortedQueue = [...queue].sort((a, b) => a - b);
    const greaterRequests = sortedQueue.filter(pos => pos > initialPosition);
    const lesserRequests = sortedQueue.filter(pos => pos < initialPosition);

    // Xử lý theo hướng di chuyển ban đầu
    if (initialDirection === 'up') {
        // Xử lý tất cả các yêu cầu lớn hơn vị trí hiện tại
        for (const position of greaterRequests) {
            sequence.push(position);
            totalSeekDistance += Math.abs(position - currentPosition);
            currentPosition = position;
        }

        // Nếu có yêu cầu ở phía dưới, đổi hướng và xử lý các yêu cầu nhỏ hơn
        if (lesserRequests.length > 0) {
            // Không đi đến cuối đĩa, mà đổi hướng ngay tại yêu cầu lớn nhất
            for (const position of lesserRequests.reverse()) {
                sequence.push(position);
                totalSeekDistance += Math.abs(position - currentPosition);
                currentPosition = position;
            }
        }
    } else {
        // Xử lý tất cả các yêu cầu nhỏ hơn vị trí hiện tại
        for (const position of lesserRequests.reverse()) {
            sequence.push(position);
            totalSeekDistance += Math.abs(position - currentPosition);
            currentPosition = position;
        }

        // Nếu có yêu cầu ở phía trên, đổi hướng và xử lý các yêu cầu lớn hơn
        if (greaterRequests.length > 0) {
            // Không đi đến đầu đĩa, mà đổi hướng ngay tại yêu cầu nhỏ nhất
            for (const position of greaterRequests) {
                sequence.push(position);
                totalSeekDistance += Math.abs(position - currentPosition);
                currentPosition = position;
            }
        }
    }

    return { sequence, totalSeekDistance, jumpPoints };
};


export const clook = (queue, initialPosition) => {
    const sequence = [initialPosition];
    let totalSeekDistance = 0;
    let currentPosition = initialPosition;
    const jumpPoints = []; // Mảng lưu các điểm nhảy

    // Sắp xếp các yêu cầu và chia thành các yêu cầu lớn hơn và nhỏ hơn vị trí hiện tại
    const sortedQueue = [...queue].sort((a, b) => a - b);
    const greaterRequests = sortedQueue.filter(pos => pos > initialPosition);
    const lesserRequests = sortedQueue.filter(pos => pos < initialPosition);

    // Xử lý tất cả các yêu cầu lớn hơn vị trí hiện tại
    for (const position of greaterRequests) {
        sequence.push(position);
        totalSeekDistance += Math.abs(position - currentPosition);
        currentPosition = position;
    }

    // Nếu không còn yêu cầu nào lớn hơn, quay lại đầu đĩa (không tính thời gian seek cho bước nhảy trong C-LOOK)
    if (lesserRequests.length > 0) {
        // Lưu vị trí nhảy từ yêu cầu lớn nhất đến yêu cầu nhỏ nhất
        jumpPoints.push({
            from: sequence.length - 1, // Vị trí yêu cầu lớn nhất trong sequence
            to: sequence.length // Vị trí yêu cầu nhỏ nhất sẽ là phần tử tiếp theo
        });

        // Di chuyển đến yêu cầu nhỏ nhất trong danh sách yêu cầu nhỏ hơn
        const smallestRequest = lesserRequests[0];
        sequence.push(smallestRequest);
        currentPosition = smallestRequest;

        // Process remaining requests
        for (let i = 1; i < lesserRequests.length; i++) {
            const position = lesserRequests[i];
            sequence.push(position);
            totalSeekDistance += Math.abs(position - currentPosition);
            currentPosition = position;
        }
    }

    return { sequence, totalSeekDistance, jumpPoints };
};