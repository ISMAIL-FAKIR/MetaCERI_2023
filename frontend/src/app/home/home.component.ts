import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification.service';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { PostsService } from '../posts.service';
import io from 'socket.io-client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  successMessage: string | null = null;
  shareMessage: string | null = null;
  posts: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  hashtagToFilter: string = '';

  private socket: any;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private postsService: PostsService
  ) {}

  logout(): void {
    this.notificationService.showLogoutMessage('Logout successful, By By !');
    localStorage.removeItem('lastLoginTime');
    this.router.navigate(['/login']);
  }

  //afficher les posts
  loadPosts(page: number) {
    this.postsService.getPosts(page).subscribe(
      (data: any) => {
        this.posts = data.posts;
        this.currentPage = page;
        this.totalPages = data.totalPages;
      },
      (error) => {
        console.error('Error loading posts', error);
      }
    );
  }

  //ajouter un like
  likePost(post: any) {
    this.postsService.likePost(post._id).subscribe(() => {
      this.loadPosts(this.currentPage);
    });
    this.notificationService.showLikeMessage('Post liked successfully !');
  }

  // ajouter un commentaire
  addComment(postId: number, commentText: string): void {
    this.postsService.addComment(postId, commentText).subscribe(
      () => {
        this.loadPosts(this.currentPage);
      },
      (error) => {
        console.error('Error adding comment', error);
      }
    );
    this.notificationService.showCommentMessage('Comment added successfully !');
  }

  //afficher les commentaires
  toggleComments(post: any) {
    post.showComments = !post.showComments;
  }

  //partager un post
  sharePost(post: any): void {
    const username = 'Lionel10';
    this.postsService.sharePost(post._id, username).subscribe(
      () => {
        this.loadPosts(this.currentPage);
        this.notificationService.showShareMessage('Post shared successfully !');
      },
      (error) => {
        console.error('Error sharing post', error);
      }
    );
  }

  //filtrer par hashtags
  filterByHashtag() {
    this.postsService.filterByHashtag(this.hashtagToFilter).subscribe(
      (data: any) => {
        this.posts = data.posts;
        this.currentPage = 1;
        this.totalPages = data.posts.length;
      },
      (error) => {
        console.error('Error filtering posts by hashtag', error);
      }
    );
  }

  //filtrer par mes posts
  filterByUser() {
    this.postsService.filterUserPosts().subscribe(
      (data: any) => {
        this.posts = data.posts;
        this.currentPage = 1;
        this.totalPages = data.posts.length;
      },
      (error) => {
        console.error('Error filtering posts by user', error);
      }
    );
  }

  //Trie par popularité
  sortPostsByPopularity() {
    this.postsService.sortPostsByPopularity(this.currentPage).subscribe(
      (data: any) => {
        this.posts = data.sortedPosts;
        this.currentPage = 1;
        this.totalPages = data.totalPages;
      },
      (error) => {
        console.error('Error sorting posts by popularity', error);
      }
    );
  }

  //Trie par date
  sortPostsByDate() {
    this.postsService.sortPostsByDate(this.currentPage).subscribe(
      (data: any) => {
        this.posts = data.sortedPosts;
        this.currentPage = 1;
        this.totalPages = data.totalPages;
      },
      (error) => {
        console.error('Error sorting posts by date', error);
      }
    );
  }

  ngOnInit(): void {
    this.socket = io('https://pedago.univ-avignon.fr:3155');

    this.socket.on('likes', (updatedPost: any) => {
      console.log('Received updated post:', updatedPost);
    });

    this.notificationService.successMessage$.subscribe((statusMsg) => {
      this.successMessage = statusMsg;

      //la dernière connexion dans le service de notification
      this.notificationService.setLastLoginTime();
    });

    this.notificationService.getPosts().subscribe((data: any) => {
      this.posts = data.posts;
      this.currentPage = 1;
      this.totalPages = 120;
    });

    this.notificationService.shareMessage$.subscribe((statusMsg) => {
      this.shareMessage = statusMsg;
    });

    // Fetch initial posts using getPosts method
    this.postsService.getPosts(1).subscribe(
      (data: any) => {
        this.posts = data.posts;
        this.currentPage = 1;
        this.totalPages = data.totalPages;
      },
      (error) => {
        console.error('Error loading initial posts', error);
      }
    );

    // Load initial posts
    this.loadPosts(1);
  }
}
