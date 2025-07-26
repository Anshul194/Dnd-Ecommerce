import React from 'react';
import teaOne from '../../../public/images/one.webp'
import leaf from '../../../public/images/leaf.png'
import Image from 'next/image';
import heart from '../../../public/images/heart.png';

const Categories = () => {
  return (
    <div className="flex relative flex-col lg:flex-row justify-between w-full h-fit py-20 px-4 lg:px-0">
        <div className="absolute -left-30 md:-left-1/4 top-3/4 transform -translate-y-1/2 z-50">
                    <Image className='w-[40vh] md:w-[50vh] rotate-[140deg] max-h-[600px]' src={leaf} alt="Leaf" width='auto' height='auto' />
              </div>
      <div className="flex-1 relative lg:max-w-xl mb-8 lg:mb-0 lg:mr-8">
        <h1 className="!font-bebas text-4xl md:text-5xl font-black text-gray-800 leading-tight mb-6">
          WHAT'S YOUR PICK?
        </h1>
        <p className="text-black font-medium text-lg mt-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do{' '}
          <span className='text-fontGreen'>eiusmod tempor incididunt</span> ut labore et dolor magna <span className='relative w-8'>aliqua <Image src={heart}  className='absolute -right-7 -bottom-10 w-8' alt="heart-img"/></span>.
          
        </p>
        <button className="mt-4 relative z-50 bg text-white px-6 py-2 rounded hover:bg-green-700 transition-colors">
          Explore
        </button>
      </div>
      
      <div>
        <div className="w-full lg:max-w-lg flex flex-wrap  gap-4 justify-center md:justify-start">
          {['Lorem Ipsum', 'Lorem Ipsum', 'Lorem Ipsum', 'Lorem Ipsum', 'Lorem Ipsum', 'Lorem Ipsum'].map((item, index) => (
            <div key={index} className=" border-2 border w-[45%] md:w-36 min-h-48 border-gray-200 shadow-sm  rounded-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg text-white  text-sm py-2 flex items-center justify-center w-full font-medium">
                {item}
              </div>
              <div className="flex-1 flex items-center justify-center p-2">
                <Image 
                  src={teaOne} 
                  alt="Tea product"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;