import { motion, AnimatePresence, useMotionValue, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageFlipProps {
  children: ReactNode;
  pageIndex: number;
  direction: number;
  side: 'left' | 'right';
  isActive: boolean;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
  onClick?: () => void;
  dragDisabled?: boolean;
}

export function PageFlip({ children, pageIndex, direction, side, isActive, onSwipeNext, onSwipePrev, onClick, dragDisabled }: PageFlipProps) {
  const isRight = side === 'right';
  const dragX = useMotionValue(0);

  const variants: Variants = {
    initial: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90,
      opacity: 0,
      zIndex: 1,
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      zIndex: 2,
      transition: {
        rotateY: { type: "spring", stiffness: 70, damping: 20, mass: 1 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90,
      opacity: 0,
      zIndex: 10,
      transition: {
        rotateY: { type: "spring", stiffness: 70, damping: 20, mass: 1 },
        opacity: { duration: 0.3 }
      }
    })
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 50; // Smaller threshold for easier swiping
    if (isRight && info.offset.x < -threshold) {
      onSwipeNext?.();
    } else if (!isRight && info.offset.x > threshold) {
      onSwipePrev?.();
    }
    dragX.set(0);
  };

  return (
    <div
      className={`relative w-full h-full [perspective:2500px] [transform-style:preserve-3d] ${isActive ? 'z-10' : 'z-0'}`}
      onClick={(_: any) => {
        if (Math.abs(dragX.get()) < 5) {
          onClick?.();
        }
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={pageIndex}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          drag={dragDisabled ? false : "x"}
          dragConstraints={{ left: isRight ? -400 : 0, right: isRight ? 0 : 400 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{
            transformOrigin: isRight ? 'left center' : 'right center',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'transform, opacity',
          }}
          className={`absolute inset-0 w-full h-full bg-[#f4efe6] dark:bg-zinc-900 rounded-r-sm shadow-[5px_0_15px_rgba(0,0,0,0.05)] border-l border-black/5 ${dragDisabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        >
          {/* Subtle Page Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] mix-blend-multiply" />

          {/* Spine Lighting Shadow */}
          <div
            className={`absolute inset-y-0 w-12 pointer-events-none z-20 ${isRight
              ? 'left-0 bg-gradient-to-r from-black/10 via-black/[0.02] to-transparent'
              : 'right-0 bg-gradient-to-l from-black/10 via-black/[0.02] to-transparent'
              }`}
          />

          {/* Dynamic Page Bend Shadow Overlay during animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-30"
            animate={{
              background: isActive
                ? 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0))'
                : 'linear-gradient(to right, rgba(0,0,0,0.05), rgba(0,0,0,0))'
            }}
          />

          {/* Content Area */}
          <div className="relative z-10 h-full p-12 md:p-16 lg:p-20 overflow-hidden font-serif selection:bg-primary/20">
            <div className="text-[#332f2a] dark:text-zinc-300 leading-[1.8] text-[17px] text-justify tracking-wide antialiased">
              {children || <span className="opacity-0">Loading...</span>}
            </div>
          </div>

          {/* Page Curl Hint (Hover) */}
          <motion.div
            className={`absolute top-0 bottom-0 w-8 pointer-events-none z-40 hidden md:block ${isRight ? 'right-0' : 'left-0'}`}
            whileHover={{ opacity: 1 }}
            initial={{ opacity: 0 }}
          >
            <div className={`h-full w-full bg-gradient-to-${isRight ? 'l' : 'r'} from-black/[0.03] to-transparent`} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
