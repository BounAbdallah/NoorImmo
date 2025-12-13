import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDE_DATA = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1600596542815-6ad4c728fdbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        title: "Villa de Luxe aux Almadies",
        location: "Almadies, Dakar",
        price: "2 500 000 FCFA / mois",
        tag: "Location"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        title: "Appartement Vue Mer",
        location: "Plateau, Dakar",
        price: "1 200 000 FCFA / mois",
        tag: "Location"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        title: "Duplex Moderne",
        location: "Point E, Dakar",
        price: "850 000 FCFA / mois",
        tag: "Location"
    }
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);
    const length = SLIDE_DATA.length;

    const nextSlide = () => {
        setCurrent(current === length - 1 ? 0 : current + 1);
    };

    const prevSlide = () => {
        setCurrent(current === 0 ? length - 1 : current - 1);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [current]);

    if (!Array.isArray(SLIDE_DATA) || SLIDE_DATA.length <= 0) {
        return null;
    }

    return (
        <div className="relative h-[600px] w-full overflow-hidden group">
            {SLIDE_DATA.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 bg-gray-900/40 z-10" />
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />

                    {/* Content */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
                        <span className="inline-block py-1 px-4 rounded-full bg-primary-600 text-white text-sm font-semibold tracking-wide uppercase mb-4 animate-[fadeInDown_1s_ease-out]">
                            {slide.tag}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight shadow-black drop-shadow-lg animate-[fadeInUp_1s_ease-out_0.2s]">
                            {slide.title}
                        </h1>
                        <div className="flex items-center text-white/90 text-lg md:text-xl mb-8 animate-[fadeInUp_1s_ease-out_0.4s]">
                            <MapPin className="h-5 w-5 mr-2 text-primary-400" />
                            {slide.location}
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-white mb-8 animate-[fadeInUp_1s_ease-out_0.6s]">
                            {slide.price}
                        </p>

                        <div className="flex gap-4 animate-[fadeInUp_1s_ease-out_0.8s]">
                            <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center">
                                En savoir plus
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link to="/features" className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold py-3 px-8 rounded-full border-2 border-white/50 transition-all duration-300 transform hover:scale-105">
                                Voir les offres
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slider Controls */}
            <button
                className="absolute top-1/2 left-4 z-30 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm transition-all transform -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:outline-none"
                onClick={prevSlide}
            >
                <ChevronLeft className="h-8 w-8" />
            </button>
            <button
                className="absolute top-1/2 right-4 z-30 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm transition-all transform -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:outline-none"
                onClick={nextSlide}
            >
                <ChevronRight className="h-8 w-8" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                {SLIDE_DATA.map((_, idx) => (
                    <button
                        key={idx}
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${current === idx ? 'bg-primary-500 w-8' : 'bg-white/50 hover:bg-white'
                            }`}
                        onClick={() => setCurrent(idx)}
                    />
                ))}
            </div>
        </div>
    );
}
