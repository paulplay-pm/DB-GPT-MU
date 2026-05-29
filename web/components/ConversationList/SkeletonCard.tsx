'use client';

import { Skeleton } from 'antd';

function SkeletonCard() {
  return (
    <div className='flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent'>
      <Skeleton.Avatar active size='small' shape='square' className='rounded' />
      <div className='flex-1'>
        <Skeleton.Input active className='w-3/4 mb-2' size='small' />
        <Skeleton.Input active className='w-1/2' size='small' />
      </div>
    </div>
  );
}

export default SkeletonCard;
