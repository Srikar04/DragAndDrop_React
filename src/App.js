import React,{useEffect} from "react";
import { useDrop, useDrag } from "react-dnd";

const Card = ({ src, title, id, index, moveImage }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: "image",
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveImage(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: () => {
      return { id, index };
    },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity }} className="card">
      <img src={src} alt={title} />
    </div>
  );
};

const App = () => {
  // Using local Storage to persist the state
  const [images, setImages] = React.useState(() => {
    const storedImages = localStorage.getItem("images");
    return storedImages ? JSON.parse(storedImages) : [];
  });

  const [currentIndex, setCurrentIndex] = React.useState(() => {
    const storedIndex = localStorage.getItem("currentIndex");
    return storedIndex ? parseInt(storedIndex, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem("images", JSON.stringify(images));
    localStorage.setItem("currentIndex", currentIndex.toString());
  }, [images, currentIndex]);

  const moveImage = React.useCallback((dragIndex, hoverIndex) => {
    setImages((prevCards) => {
      const clonedCards = [...prevCards];
      const removedItem = clonedCards.splice(dragIndex, 1)[0];
      clonedCards.splice(hoverIndex, 0, removedItem);
      return clonedCards;
    });
  }, []);

  const handleAddImage = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      const newImage = {
        id: currentIndex,
        img: imageUrl,
      };

      setImages((prevImages) => [...prevImages, newImage]);
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const [darkTheme, setDarkTheme] = React.useState(false);

  const handleToggleTheme = () => {
    setDarkTheme((prevTheme) => !prevTheme);
  }

  return (
    <div style={{ background: darkTheme ? "black" : "white", color: darkTheme ? "white" : "black" }}>
      <h1>Drag and Drop</h1>
      <input type="file" accept="image/*" onChange={handleAddImage} />
      <button onClick={handleToggleTheme}>Change Theme</button>
      <main style={{ background: darkTheme ? "black" : "white"}}>
        {React.Children.toArray(
          images.map((image, index) => (
            <Card
              src={image.img}
              title={image.title}
              id={image.id}
              index={index}
              moveImage={moveImage}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default App;
