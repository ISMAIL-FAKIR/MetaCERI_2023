import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private apiUrl = 'https://pedago.univ-avignon.fr:3155';

  constructor(private http: HttpClient) {}

  //afficher les posts
  getPosts(page: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getposts?page=${page}`);
  }

  //ajouter un like
  likePost(postId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/addLike?idPost=${postId}`);
  }

  //ajouter comment
  addComment(postId: number, commentText: string): Observable<any> {
    const body = { postId, commentText };
    return this.http.post(`${this.apiUrl}/addComment`, body);
  }

  //partager un post
  sharePost(postId: number, username: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/Share?sharedPost=${postId}&username=${username}`
    );
  }

  //filtrer par hashtags
  filterByHashtag(hashtag: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/filterByHashtag?hashtag=${hashtag}`);
  }

  //filtrer par mes posts
  filterUserPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filterMyPost`);
  }

  //Trie par popularité
  sortPostsByPopularity(page: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sortPostsByPopularity?page=${page}`);
  }

  //Trie par date
  sortPostsByDate(page: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sortPostsByDate?page=${page}`);
  }
}
