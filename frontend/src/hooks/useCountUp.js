import { useState, useEffect } from "react";

/**
 * Custom hook để tạo hiệu ứng count-up cho số
 * @param {number} end - Giá trị đích cần đếm đến
 * @param {number} duration - Thời gian chạy animation (ms), mặc định 2000ms
 * @param {number} startDelay - Thời gian delay trước khi bắt đầu (ms), mặc định 0ms
 * @returns {number} - Giá trị hiện tại đang đếm
 */
const useCountUp = (end, duration = 2000, startDelay = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrame = null;
    let startTime = null;

    const startAnimation = () => {
      const animate = (timestamp) => {
        if (!startTime) {
          startTime = timestamp;
        }

        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        // Easing function - ease out cubic để tạo hiệu ứng nhanh dần rồi chậm lại
        const easeOutCubic = 1 - Math.pow(1 - percentage, 3);

        const currentCount = Math.floor(easeOutCubic * end);
        setCount(currentCount);

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(end); // Đảm bảo giá trị cuối chính xác
        }
      };

      animationFrame = requestAnimationFrame(animate);
    };

    // Delay trước khi bắt đầu animation
    const delayTimer = setTimeout(startAnimation, startDelay);

    return () => {
      clearTimeout(delayTimer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, startDelay]);

  return count;
};

export default useCountUp;
