"""
Routes package for KBee Manager
"""

from .auth import auth_bp
from .beehives import beehives_bp

__all__ = ['auth_bp', 'beehives_bp']
