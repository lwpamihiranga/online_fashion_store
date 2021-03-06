import React from 'react';
import filledStar from '../../images/filled_rating.png';
import unfilledStar from '../../images/unfilled_rating.png';
import editImage from '../../images/edit.png';
import finishImage from '../../images/finish.png';
import deleteImage from '../../images/delete.png';
import css from '../../css/rateList.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginState = require('../../_helpers/loginState');

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ratingList: [],
            isNeedToGetFromServer: true,
            isRatingNeedsToBeChanged: true,
            starSize: [1, 2, 3, 4, 5],
            selectedStarCount: 1,
            userTypingComment: '',
            userCommentId: '',
            ratingStarCount: 0,
            ratingAvg: 0.0,
        };

        this.updateRating = this.updateRating.bind();
        this.deleteRating = this.deleteRating.bind();
    }
    render() {
        //productId
        const productId = this.props.productId;
        if (this.state.isNeedToGetFromServer) {
            this.getRatingsByProductId(productId);
        }

        const list = this.state.ratingList.map((rating) => {
            if (rating.userId !== LoginState.getUserId()) {
                let comment = rating.comment;
                let username = rating.username;
                let imageLink = rating.imageLink;

                const finalImageLink = require('../../uploads/profile-pic/' + imageLink);

                const rate = this.state.starSize.map((i) => {
                    return (
                        <div className="fivestars">
                            {rating.rate >= i && <img className="star" src={filledStar} />}
                            {rating.rate < i && <img className="star" src={unfilledStar} />}
                        </div>
                    );
                });

                return (
                    <div className="rateItemContainer mt-1 bg-primary">
                        <div className="rateImageDiv">
                            <img src={finalImageLink} className="rateImage rounded-circle" />
                        </div>

                        <div className="rateRowDiv">
                            <div>
                                <strong className="ratingUserName">{username}</strong>
                            </div>
                            <div className="rowStarContainer">
                                <div className="Rowstars">{rate}</div>
                            </div>

                            <div>
                                <p>{comment}</p>
                            </div>
                        </div>
                    </div>
                );
            } else {
                if (this.state.isRatingNeedsToBeChanged) {
                    console.log(rating.comment);
                    //this is a rating of the current login user
                    this.state.userTypingComment = rating.comment;
                    this.state.userCommentId = rating._id;
                    this.state.isRatingNeedsToBeChanged = false;
                    this.state.selectedStarCount = rating.rate;
                }
            }
        });

        const userInputRatings = this.state.starSize.map((i) => {
            return (
                <div className="input" key={i}>
                    {i <= this.state.selectedStarCount && (
                        <img
                            className="inputstarActive"
                            src={filledStar}
                            onClick={() => this.setState({ selectedStarCount: i })}
                        />
                    )}
                    {i > this.state.selectedStarCount && (
                        <img
                            className="inputstarInactive"
                            src={unfilledStar}
                            onClick={() => this.setState({ selectedStarCount: i })}
                        />
                    )}
                </div>
            );
        });

        return (
            <div className="ratingContainer">
                <div className="ratingList mt-3">
                    <div className="avgDiv">
                        <strong>{this.state.ratingList.length + ' RATINGS'}</strong>
                        <strong>{this.state.ratingAvg.toFixed(1) + ' AVERAGE'}</strong>
                    </div>
                    <div className="userInputRating">
                        <div className="rateItem">{userInputRatings}</div>
                        <div className="crudOperations  mt-2">
                            <input
                                className="form-control"
                                type="text"
                                onChange={(e) => this.setState({ userTypingComment: e.target.value })}
                                value={this.state.userTypingComment}
                                placeholder="Enter your comment"
                            />
                            <img
                                className="crudImg"
                                onClick={() =>
                                    this.updateRating(
                                        LoginState.getUserId(),
                                        productId,
                                        this.state.userCommentId,
                                        this.state.userTypingComment,
                                        this.state.selectedStarCount
                                    )
                                }
                                src={finishImage}
                            />

                            {this.state.userCommentId !== '' && (
                                <img
                                    className="crudImg"
                                    onClick={() => this.deleteRating(productId, this.state.userCommentId)}
                                    src={deleteImage}
                                />
                            )}
                        </div>
                    </div>
                    <div className="mt-3">{list}</div>
                </div>
            </div>
        );
    }
    getRatingsByProductId(id) {
        //loading products according to the id and store in states
        axios
            .get('http://localhost:5000/api/ratings/findByProductId?productId=' + id)
            .then((response) => {
                if (response.status === 200) {
                    if (this.state.isNeedToGetFromServer) {
                        var list = response.data;
                        //making it reverse to get the latest comment to the top
                        list.reverse();
                        var count = 0;

                        list.map((item, index) => {
                            count = count + item.rate;

                            if (index === list.length - 1) {
                                var avg = 0.0;
                                avg = count / list.length;
                                this.setState({
                                    ratingList: list,
                                    isNeedToGetFromServer: false,
                                    isRatingNeedsToBeChanged: true,
                                    starSize: [1, 2, 3, 4, 5],
                                    ratingStarCount: count,
                                    ratingAvg: avg,
                                });
                            }
                        });
                    }
                }
            })
            .catch((error) => console.log(error));
    }
    updateRating = (userId, productId, ratingId, comment, rate) => {
        if (!LoginState.isUser()) {
            return;
        }
        if (this.state.userTypingComment === '') {
            alert('Enter a comment');
        } else {
            if (ratingId !== '') {
                //user needs to update
                axios
                    .post(
                        'http://localhost:5000/api/ratings/update?rateId=' +
                            ratingId +
                            '&rate=' +
                            rate +
                            '&comment=' +
                            comment
                    )
                    .then((response) => {
                        if (response.status === 200) {
                            var list = response.data;
                            this.setState({
                                isRatingNeedsToBeChanged: true,
                                isNeedToGetFromServer: true,
                                ratingList: [],
                            });
                        }
                    })
                    .catch((error) => console.log(error));
            } else {
                //user needs to create new rating
                axios
                    .post(
                        'http://localhost:5000/api/ratings/create?userId=' +
                            userId +
                            '&productId=' +
                            productId +
                            '&comment=' +
                            comment +
                            '&rate=' +
                            rate +
                            '&imageLink=' +
                            LoginState.getUserImage() +
                            '&username=' +
                            LoginState.getUserName()
                    )
                    .then((response) => {
                        if (response.status === 200) {
                            var list = response.data;
                            this.setState({
                                isRatingNeedsToBeChanged: true,
                                isNeedToGetFromServer: true,
                                ratingList: [],
                            });
                        }
                    })
                    .catch((error) => console.log(error));
            }
        }
    };
    deleteRating = (productId, id) => {
        if (!LoginState.isUser()) {
            return;
        }

        axios
            .post('http://localhost:5000/api/ratings/delete?rateId=' + id)
            .then((response) => {
                if (response.status === 200) {
                    var list = response.data;
                    this.setState({
                        isRatingNeedsToBeChanged: true,
                        isNeedToGetFromServer: true,
                        ratingList: [],
                        userTypingComment: '',
                        userCommentId: '',
                        selectedStarCount: 1,
                    });

                    this.getRatingsByProductId(productId);
                }
            })
            .catch((error) => console.log(error));
    };
}
export default App;
