import './src/main.css';
import ready from '@rbx/core-scripts/util/ready';
import { renderWithErrorBoundary } from '@rbx/core-scripts/react';
import FriendsApp from '@rbx/friends/friends';

ready(() => {
  const entryPoint =
    document.getElementById('friends-container') || document.getElementById('friends-web-app');
  if (entryPoint) {
    renderWithErrorBoundary(<FriendsApp />, entryPoint);
  }
});
