import React, { useState, useRef, useCallback } from 'react';
import { 
  Plus, Trash2, Edit3, Eye, Save, Settings, Type, Image, Quote, 
  List, Code, GripVertical, Layout, FileText, Tag, Upload, Folder,
  Monitor, Smartphone, Tablet, ChevronDown, ChevronUp, Grid, 
  Columns, Calendar, User, BookOpen, Camera, Link, Globe, 
  MoreVertical, Copy, Move, Palette, AlignLeft, AlignCenter, AlignRight,
  ChevronLeft, ChevronRight, MousePointer, Layers, Star, Heart,
  ShoppingBag, Award, Shield, Users, Zap, Target, Play, Video,
  Phone, Mail, MapPin, Clock, Check, ArrowRight, ExternalLink,
  Search, Filter, SortAsc, Undo, Redo, Download, Share2,
  Edit,
  Trash
} from 'lucide-react';

const BlogPageBuilder = () => {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [viewportMode, setViewportMode] = useState('desktop');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [draggedItem, setDraggedItem] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [pageSettings, setPageSettings] = useState({
    title: 'Wedding Ring Guide',
    slug: 'wedding-ring-guide',
    description: 'Complete guide to choosing the perfect wedding ring',
    favicon: '',
    customCSS: '',
    headerCode: '',
    footerCode: '',
    seoTitle: 'Wedding Ring Guide - Complete Guide to Choosing Perfect Rings',
    seoDescription: 'Discover everything you need to know about choosing the perfect wedding ring. From styles to sizing, find your ideal ring.',
    socialImage: '',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif'
  });

  const [globalStyles, setGlobalStyles] = useState({
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
    shadows: true,
    animations: true
  });

  const componentCategories = [
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'content', name: 'Content', icon: FileText },
    { id: 'media', name: 'Media', icon: Image },
    { id: 'forms', name: 'Forms', icon: Edit3 },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag },
    { id: 'navigation', name: 'Navigation', icon: Link },
    { id: 'social', name: 'Social', icon: Users }
  ];

  const componentTypes = [
    // Layout Components
    { 
      id: 'hero', 
      name: 'Hero Section', 
      icon: Star, 
      category: 'layout',
      defaultProps: { 
        title: 'Wedding Ring Guide',
        subtitle: 'Everything you need to know about choosing the perfect wedding ring',
        description: 'From classic bands to modern designs, discover the ring that tells your unique love story.',
        backgroundImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=600&fit=crop',
        overlayOpacity: 0.4,
        textAlign: 'center',
        buttonText: 'Start Your Journey',
        buttonUrl: '#guide',
        height: 'h-screen',
        textColor: 'text-white'
      } 
    },
    { 
      id: 'section', 
      name: 'Section', 
      icon: Layout, 
      category: 'layout',
      defaultProps: { 
        backgroundColor: 'bg-white',
        padding: 'py-16 px-4',
        maxWidth: 'max-w-7xl',
        margin: 'mx-auto'
      } 
    },
    { 
      id: 'container', 
      name: 'Container', 
      icon: Grid, 
      category: 'layout',
      defaultProps: { 
        maxWidth: 'max-w-6xl',
        margin: 'mx-auto',
        padding: 'px-4'
      } 
    },
    { 
      id: 'columns', 
      name: 'Columns', 
      icon: Columns, 
      category: 'layout',
      defaultProps: {
        columnCount: 2,
        gap: 'gap-8',
        responsive: true,
        columns: [
          { content: 'Left column content', padding: 'p-6', backgroundColor: 'bg-gray-50' },
          { content: 'Right column content', padding: 'p-6', backgroundColor: 'bg-gray-50' }
        ]
      }
    },
    
    // Content Components
    { 
      id: 'heading', 
      name: 'Heading', 
      icon: Type, 
      category: 'content',
      defaultProps: { 
        text: 'Types of Wedding Rings', 
        level: 'h2', 
        align: 'center',
        color: 'text-gray-900',
        size: 'text-4xl',
        fontWeight: 'font-bold',
        marginBottom: 'mb-8',
        maxWidth: 'max-w-4xl',
        margin: 'mx-auto'
      } 
    },
    { 
      id: 'paragraph', 
      name: 'Paragraph', 
      icon: FileText, 
      category: 'content',
      defaultProps: { 
        text: 'Choosing the perfect wedding ring is one of the most important decisions you\'ll make. Our comprehensive guide covers everything from traditional gold bands to contemporary diamond settings, helping you find the ring that perfectly symbolizes your love and commitment.',
        align: 'left',
        color: 'text-gray-600',
        size: 'text-lg',
        lineHeight: 'leading-relaxed',
        marginBottom: 'mb-6',
        maxWidth: 'max-w-4xl'
      } 
    },
    { 
      id: 'feature-grid', 
      name: 'Feature Grid', 
      icon: Grid, 
      category: 'content',
      defaultProps: {
        title: 'Why Choose Our Rings?',
        features: [
          { 
            icon: 'award', 
            title: 'Premium Quality', 
            description: 'Crafted with the finest materials and attention to detail',
            color: 'text-blue-600'
          },
          { 
            icon: 'shield', 
            title: 'Lifetime Warranty', 
            description: 'Comprehensive coverage for peace of mind',
            color: 'text-green-600'
          },
          { 
            icon: 'users', 
            title: 'Expert Guidance', 
            description: 'Professional consultation throughout your journey',
            color: 'text-purple-600'
          },
          { 
            icon: 'heart', 
            title: 'Custom Design', 
            description: 'Personalized rings crafted just for you',
            color: 'text-red-600'
          }
        ],
        columns: 2,
        gap: 'gap-8'
      }
    },
    { 
      id: 'timeline', 
      name: 'Timeline', 
      icon: Clock, 
      category: 'content',
      defaultProps: {
        title: 'Your Ring Journey',
        steps: [
          { 
            title: 'Consultation', 
            description: 'Meet with our experts to discuss your vision and preferences',
            duration: 'Week 1'
          },
          { 
            title: 'Design Process', 
            description: 'Create custom designs and select materials',
            duration: 'Week 2-3'
          },
          { 
            title: 'Crafting', 
            description: 'Our master craftsmen bring your ring to life',
            duration: 'Week 4-6'
          },
          { 
            title: 'Final Delivery', 
            description: 'Receive your perfect wedding ring',
            duration: 'Week 7'
          }
        ]
      }
    },
    
    // Media Components
    { 
      id: 'image', 
      name: 'Image', 
      icon: Image, 
      category: 'media',
      defaultProps: { 
        src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=600&fit=crop', 
        alt: 'Beautiful wedding rings', 
        caption: 'Handcrafted wedding rings designed for your special day',
        width: '100%',
        rounded: 'rounded-xl',
        shadow: 'shadow-2xl',
        link: '',
        objectFit: 'object-cover'
      } 
    },
    { 
      id: 'gallery', 
      name: 'Gallery', 
      icon: Camera, 
      category: 'media',
      defaultProps: {
        title: 'Ring Gallery',
        images: [
          { url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=400&fit=crop', alt: 'Classic Gold Band', title: 'Classic Gold' },
          { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', alt: 'Diamond Ring', title: 'Diamond Solitaire' },
          { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', alt: 'Vintage Ring', title: 'Vintage Style' },
          { url: 'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400&h=400&fit=crop', alt: 'Modern Band', title: 'Modern Design' }
        ],
        columns: 2,
        spacing: 'gap-6',
        showTitles: true,
        aspectRatio: 'aspect-square'
      }
    },
    { 
      id: 'video', 
      name: 'Video', 
      icon: Video, 
      category: 'media',
      defaultProps: {
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'Wedding Ring Crafting Process',
        description: 'Watch how our master craftsmen create each ring by hand',
        thumbnail: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=450&fit=crop',
        autoplay: false,
        controls: true,
        aspectRatio: 'aspect-video'
      }
    },
    
    // Interactive Components
    { 
      id: 'cta-section', 
      name: 'Call to Action', 
      icon: Target, 
      category: 'content',
      defaultProps: {
        title: 'Ready to Find Your Perfect Ring?',
        description: 'Schedule a consultation with our experts and begin your journey to the perfect wedding ring.',
        buttonText: 'Book Consultation',
        buttonUrl: '/consultation',
        buttonStyle: 'primary',
        backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
        textColor: 'text-white',
        padding: 'py-20 px-8',
        align: 'center'
      }
    },
    { 
      id: 'testimonial', 
      name: 'Testimonial', 
      icon: Quote, 
      category: 'content',
      defaultProps: {
        quote: 'The team helped us create the most beautiful wedding rings. The attention to detail and personal service was exceptional.',
        author: 'Sarah & Michael Johnson',
        role: 'Happy Couple',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        backgroundColor: 'bg-gray-50',
        padding: 'p-8'
      }
    },
    { 
      id: 'faq', 
      name: 'FAQ Section', 
      icon: Quote, 
      category: 'content',
      defaultProps: {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            question: 'How long does it take to create a custom ring?',
            answer: 'Custom rings typically take 4-6 weeks from design approval to completion.'
          },
          {
            question: 'Do you offer ring resizing?',
            answer: 'Yes, we offer complimentary resizing within 30 days of purchase.'
          },
          {
            question: 'What materials do you work with?',
            answer: 'We work with gold, platinum, silver, and alternative metals, plus a wide selection of gemstones.'
          }
        ]
      }
    },
    
    // E-commerce Components
    { 
      id: 'product-showcase', 
      name: 'Product Showcase', 
      icon: ShoppingBag, 
      category: 'ecommerce',
      defaultProps: {
        title: 'Featured Collections',
        products: [
          {
            name: 'Classic Gold Band',
            price: '$899',
            image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&h=300&fit=crop',
            description: 'Timeless 14k gold wedding band',
            badge: 'Bestseller'
          },
          {
            name: 'Diamond Solitaire',
            price: '$2,499',
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop',
            description: '1ct diamond engagement ring',
            badge: 'Premium'
          },
          {
            name: 'Vintage Collection',
            price: '$1,299',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop',
            description: 'Art deco inspired design',
            badge: 'Limited'
          }
        ],
        columns: 3,
        showPrices: true,
        showBadges: true
      }
    },
    
    // Navigation Components
    { 
      id: 'breadcrumb', 
      name: 'Breadcrumb', 
      icon: ArrowRight, 
      category: 'navigation',
      defaultProps: {
        items: [
          { label: 'Home', url: '/' },
          { label: 'Education', url: '/education' },
          { label: 'Wedding Ring Guide', url: '/wedding-ring-guide' }
        ],
        separator: '/',
        color: 'text-gray-500'
      }
    }
  ];

  // Component Management
  const addComponent = useCallback((type) => {
    const componentType = componentTypes.find(c => c.id === type);
    const newComponent = {
      id: Date.now() + Math.random(),
      type,
      props: { ...componentType.defaultProps }
    };
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    saveToHistory(newComponents);
  }, [components]);

  const updateComponent = useCallback((id, newProps) => {
    const newComponents = components.map(comp => 
      comp.id === id ? { ...comp, props: { ...comp.props, ...newProps } } : comp
    );
    setComponents(newComponents);
    saveToHistory(newComponents);
  }, [components]);

  const deleteComponent = useCallback((id) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    setSelectedComponent(null);
    saveToHistory(newComponents);
  }, [components]);

  const duplicateComponent = useCallback((id) => {
    const component = components.find(comp => comp.id === id);
    if (component) {
      const newComponent = {
        ...component,
        id: Date.now() + Math.random()
      };
      const index = components.findIndex(comp => comp.id === id);
      const newComponents = [...components];
      newComponents.splice(index + 1, 0, newComponent);
      setComponents(newComponents);
      saveToHistory(newComponents);
    }
  }, [components]);

  const moveComponent = useCallback((dragIndex, dropIndex) => {
    const draggedComponent = components[dragIndex];
    const newComponents = [...components];
    newComponents.splice(dragIndex, 1);
    newComponents.splice(dropIndex, 0, draggedComponent);
    setComponents(newComponents);
    saveToHistory(newComponents);
  }, [components]);

  // History Management
  const saveToHistory = (newComponents) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newComponents);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(history[historyIndex + 1]);
    }
  };

  // Drag and Drop
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      moveComponent(draggedItem, dropIndex);
    }
    setDraggedItem(null);
  };

  // Icon mapping for dynamic icons
  const iconMap = {
    award: Award,
    shield: Shield,
    users: Users,
    heart: Heart,
    star: Star,
    zap: Zap,
    target: Target
  };

  // Component Renderers
  const renderComponent = (component, index) => {
    const { type, props } = component;
    const isSelected = selectedComponent === component.id;
    
    const componentClasses = `
      ${isSelected && !previewMode ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      ${!previewMode ? 'hover:ring-1 hover:ring-gray-300 cursor-pointer' : ''}
      transition-all duration-200 relative group
    `;
    
    switch (type) {
      case 'hero':
        return (
          <div 
            className={`${componentClasses} relative ${props.height} flex items-center justify-center overflow-hidden`}
            style={{
              backgroundImage: `url(${props.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: props.overlayOpacity }}
            ></div>
            <div className={`relative z-10 max-w-4xl mx-auto px-4 text-${props.textAlign}`}>
              <h1 className={`text-6xl font-bold ${props.textColor} mb-6 leading-tight`}>
                {props.title}
              </h1>
              {props.subtitle && (
                <h2 className={`text-2xl ${props.textColor} mb-6 opacity-90`}>
                  {props.subtitle}
                </h2>
              )}
              {props.description && (
                <p className={`text-xl ${props.textColor} mb-8 opacity-80 max-w-2xl ${props.textAlign === 'center' ? 'mx-auto' : ''}`}>
                  {props.description}
                </p>
              )}
              {props.buttonText && (
                <a 
                  href={props.buttonUrl}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {props.buttonText}
                </a>
              )}
            </div>
          </div>
        );

      case 'section':
        return (
          <section className={`${componentClasses} ${props.backgroundColor} ${props.padding}`}>
            <div className={`${props.maxWidth} ${props.margin}`}>
              {/* Section content will be added by other components */}
            </div>
          </section>
        );

      case 'heading':
        const HeadingTag = props.level;
        return (
          <div className={componentClasses}>
            <HeadingTag 
              className={`${props.fontWeight} ${props.marginBottom} ${props.size} ${props.color} text-${props.align} leading-tight ${props.maxWidth} ${props.margin}`}
            >
              {props.text}
            </HeadingTag>
          </div>
        );

      case 'paragraph':
        return (
          <div className={componentClasses}>
            <p className={`${props.marginBottom} ${props.size} ${props.color} ${props.lineHeight} text-${props.align} ${props.maxWidth}`}>
              {props.text}
            </p>
          </div>
        );

      case 'feature-grid':
        return (
          <div className={`${componentClasses} py-16`}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{props.title}</h2>
              <div className={`grid grid-cols-1 md:grid-cols-${props.columns} ${props.gap}`}>
                {props.features.map((feature, i) => {
                  const IconComponent = iconMap[feature.icon] || Star;
                  return (
                    <div key={i} className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                      <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} bg-opacity-10 rounded-full mb-6`}>
                        <IconComponent className={`w-8 h-8 ${feature.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className={`${componentClasses} py-16 bg-gray-50`}>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{props.title}</h2>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-600"></div>
                {props.steps.map((step, i) => (
                  <div key={i} className="relative flex items-start mb-12 last:mb-0">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {i + 1}
                    </div>
                    <div className="ml-8 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                        <span className="text-sm text-blue-600 font-medium">{step.duration}</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'image':
        const ImageContent = (
          <div className="overflow-hidden">
            <img 
              src={props.src} 
              alt={props.alt} 
              className={`w-full h-auto ${props.rounded} ${props.shadow} ${props.objectFit} transition-transform duration-300 hover:scale-105`}
              style={{ maxWidth: props.width }}
            />
          </div>
        );
        return (
          <div className={`${componentClasses} mb-8`}>
            {props.link ? (
              <a href={props.link} target="_blank" rel="noopener noreferrer">
                {ImageContent}
              </a>
            ) : ImageContent}
            {props.caption && (
              <p className="text-sm text-gray-600 mt-4 text-center italic">
                {props.caption}
              </p>
            )}
          </div>
        );

      case 'gallery':
        return (
          <div className={`${componentClasses} py-16`}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{props.title}</h2>
              <div className={`grid grid-cols-1 md:grid-cols-${props.columns} ${props.spacing}`}>
                {props.images.map((image, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <div className={`${props.aspectRatio} overflow-hidden`}>
                      <img 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    {props.showTitles && image.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cta-section':
        return (
          <div className={`${componentClasses} ${props.backgroundColor} ${props.padding} text-${props.align}`}>
            <div className="max-w-4xl mx-auto">
              <h2 className={`text-4xl font-bold ${props.textColor} mb-6`}>{props.title}</h2>
              <p className={`text-xl ${props.textColor} opacity-90 mb-8 max-w-2xl ${props.align === 'center' ? 'mx-auto' : ''}`}>
                {props.description}
              </p>
              <a 
                href={props.buttonUrl}
                className={`inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  props.buttonStyle === 'primary' 
                    ? 'bg-white text-blue-600 hover:bg-gray-100' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {props.buttonText}
              </a>
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className={`${componentClasses} ${props.backgroundColor} ${props.padding} rounded-xl`}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                {[...Array(props.rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl text-gray-700 italic mb-8 leading-relaxed">
                "{props.quote}"
              </blockquote>
              <div className="flex items-center justify-center">
                <img 
                  src={props.image} 
                  alt={props.author}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div className="text-left">
                  <cite className="text-lg font-semibold text-gray-900 not-italic">{props.author}</cite>
                  <p className="text-gray-600">{props.role}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'product-showcase':
        return (
          <div className={`${componentClasses} py-16`}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{props.title}</h2>
              <div className={`grid grid-cols-1 md:grid-cols-${props.columns} gap-8`}>
                {props.products.map((product, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                    <div className="relative overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {props.showBadges && product.badge && (
                        <div className="absolute top-4 left -4 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          {product.badge}
                        </div>
                        )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-lg text-gray-700 mb-4">{product.description}</p>
                      {props.showPrices && (
                        <div className="text-2xl font-bold text-blue-600">
                          {product.price}
                        </div>
                      )}
                        <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            View Product
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        )

        case 'breadcrumb':
            return (
                <nav className={`${componentClasses} text-${props.color} mb-8`}>
                <ol className="flex items-center space-x-2">
                    {props.items.map((item, i) => (
                    <li key={i} className="flex items-center">
                        {i > 0 && (
                        <span className="mx-2"> {props.separator} </span>
                        )}
                        <a 
                        href={item.url} 
                        className="hover:underline"
                        >
                        {item.label}
                        </a>
                    </li>
                    ))}
                </ol>
                </nav>
            );
        default:
            return (
                <div className={`${componentClasses} p-8 bg-red-100 text-red-800`}>
                    <p>Unknown component type: {type}</p>
                </div>
            );
    }
    };
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div 
                className={`w-64 bg-gray-100 border-r transition-width duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
            >
                <div className="p-4 flex items-center justify-between">
                    <h2 className={`text-lg font-semibold ${sidebarCollapsed ? 'hidden' : ''}`}>Components</h2>
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
                        className="p-2 rounded hover:bg-gray-200"
                    >
                        {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
                    </button>
                </div>
                <div className="px-4">
                    {componentCategories.map(category => (
                        <div key={category.id} className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <category.icon className="w-4 h-4 mr-2" />
                                {category.name}
                            </h3>
                            <div className="space-y-2">
                                {componentTypes
                                    .filter(c => c.category === category.id)
                                    .map(type => (
                                        <button 
                                            key={type.id} 
                                            onClick={() => addComponent(type.id)} 
                                            className="flex items-center space-x-2 w-full text-left p-2 rounded hover:bg-gray-200"
                                        >
                                            <type.icon className="w-5 h-5" />
                                            {!sidebarCollapsed && <span>{type.name}</span>}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 p-6 overflow-y-auto ${previewMode ? 'bg-gray-50' : 'bg-white'}`}>
                {/* Toolbar */}
                {!previewMode && (
                    <div className="mb-6 flex items-center justify-between">
                        <button 
                            onClick={() => setPreviewMode(!previewMode)} 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            {previewMode ? 'Exit Preview' : 'Preview Mode'}
                        </button>
                        <div className="flex items
                            space-x-2">
                            <button 
                                onClick={undo} 
                                disabled={historyIndex === 0} 
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                Undo
                            </button>
                            <button 
                                onClick={redo} 
                                disabled={historyIndex === history.length - 1} 
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                Redo
                            </button>
                            <button 
                                onClick={() => setComponents([])} 
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}
                {/* Components List */}
                <div className="space-y-6">
                    {components.map((component, index) => (
                        <div 
                            key={component.id} 
                            className={`relative ${previewMode ? '' : 'cursor-pointer'} ${selectedComponent === component.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                            onClick={() => !previewMode && setSelectedComponent(component.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            draggable={!previewMode}
                            onDragStart={(e) => handleDragStart(e, index)}
                        >
                            {renderComponent(component, index)}
                            {!previewMode && (
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button 
                                        onClick={() => duplicateComponent(component.id)} 
                                        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        <Copy />
                                    </button>
                                    <button 
                                        onClick={() => updateComponent(component.id, { ...component.props, text: prompt('Edit text:', component.props.text) || component.props.text })} 
                                        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        <Edit />
                                    </button>
                                    <button 
                                        onClick={() => deleteComponent(component.id)} 
                                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        <Trash />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Preview Mode Overlay */}
            {previewMode && (
                <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
                    <div className="max-w-6xl w-full p-8">
                        {components.map((component, index) => (
                            <div key={component.id} className="mb-8">
                                {renderComponent(component, index)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogPageBuilder;
                
