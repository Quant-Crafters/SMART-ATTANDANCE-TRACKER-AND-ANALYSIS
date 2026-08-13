import sys
import logging
from config import settings

def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured Logger instance.
    
    Args:
        name (str): Name of the logger, typically __name__.
        
    Returns:
        logging.Logger: Standard python logger with formatted stdout handler.
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
        
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger
