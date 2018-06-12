
declare namespace rxjs
{
	/**
	 * Represents a disposable resource, such as the execution of an Observable. A
	 * Subscription has one important method, `unsubscribe`, that takes no argument
	 * and just disposes the resource held by the subscription.
	 *
	 * Additionally, subscriptions may be grouped together through the `add()`
	 * method, which will attach a child Subscription to the current Subscription.
	 * When a Subscription is unsubscribed, all its children (and its grandchildren)
	 * will be unsubscribed as well.
	 *
	 * @class Subscription
	 */
    export class Subscription implements SubscriptionLike
    {
        /** @nocollapse */
        static EMPTY: Subscription;
        /**
         * A flag to indicate whether this Subscription has already been unsubscribed.
         * @type {boolean}
         */
        closed: boolean;
        /** @internal */
        protected _parent: Subscription;
        /** @internal */
        protected _parents: Subscription[];
        /** @internal */
        private _subscriptions;
        /**
         * @param {function(): void} [unsubscribe] A function describing how to
         * perform the disposal of resources when the `unsubscribe` method is called.
         */
        constructor(unsubscribe?: () => void);
        /**
         * Disposes the resources held by the subscription. May, for instance, cancel
         * an ongoing Observable execution or cancel any other type of work that
         * started when the Subscription was created.
         * @return {void}
         */
        unsubscribe(): void;
        /**
         * Adds a tear down to be called during the unsubscribe() of this
         * Subscription.
         *
         * If the tear down being added is a subscription that is already
         * unsubscribed, is the same reference `add` is being called on, or is
         * `Subscription.EMPTY`, it will not be added.
         *
         * If this subscription is already in an `closed` state, the passed
         * tear down logic will be executed immediately.
         *
         * @param {TeardownLogic} teardown The additional logic to execute on
         * teardown.
         * @return {Subscription} Returns the Subscription used or created to be
         * added to the inner subscriptions list. This Subscription can be used with
         * `remove()` to remove the passed teardown logic from the inner subscriptions
         * list.
         */
        add(teardown: TeardownLogic): Subscription;
        /**
         * Removes a Subscription from the internal list of subscriptions that will
         * unsubscribe during the unsubscribe process of this Subscription.
         * @param {Subscription} subscription The subscription to remove.
         * @return {void}
         */
        remove(subscription: Subscription): void;
        /** @internal */
        private _addParent(parent);
    }
    /** OPERATOR INTERFACES */
    export interface UnaryFunction<T, R>
    {
        (source: T): R;
    }
    export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>>
    {
    }
    export type FactoryOrValue<T> = T | (() => T);
    export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T>
    {
    }
    export interface TimestampInterface<T>
    {
        value: T;
        timestamp: number;
    }
    export interface TimeInterval<T>
    {
        value: T;
        interval: number;
    }
    /** SUBSCRIPTION INTERFACES */
    export interface Unsubscribable
    {
        unsubscribe(): void;
    }
    export type TeardownLogic = Unsubscribable | Function | void;
    export interface SubscriptionLike extends Unsubscribable
    {
        unsubscribe(): void;
        readonly closed: boolean;
    }
    export type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | InteropObservable<T>;
    /** OBSERVABLE INTERFACES */
    export interface Subscribable<T>
    {
        subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Unsubscribable;
    }
    export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T>;
    /** @deprecated use {@link InteropObservable } */
    export type ObservableLike<T> = InteropObservable<T>;
    export type InteropObservable<T> = {
    };
    /** OBSERVER INTERFACES */
    export interface NextObserver<T>
    {
        closed?: boolean;
        next: (value: T) => void;
        error?: (err: any) => void;
        complete?: () => void;
    }
    export interface ErrorObserver<T>
    {
        closed?: boolean;
        next?: (value: T) => void;
        error: (err: any) => void;
        complete?: () => void;
    }
    export interface CompletionObserver<T>
    {
        closed?: boolean;
        next?: (value: T) => void;
        error?: (err: any) => void;
        complete: () => void;
    }
    export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;
    export interface Observer<T>
    {
        closed?: boolean;
        next: (value: T) => void;
        error: (err: any) => void;
        complete: () => void;
    }
    /** SCHEDULER INTERFACES */
    export interface SchedulerLike
    {
        now(): number;
        schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
    }
    export interface SchedulerAction<T> extends Subscription
    {
        schedule(state?: T, delay?: number): Subscription;
    }
    /**
     * Implements the {@link Observer} interface and extends the
     * {@link Subscription} class. While the {@link Observer} is the public API for
     * consuming the values of an {@link Observable}, all Observers get converted to
     * a Subscriber, in order to provide Subscription-like capabilities such as
     * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
     * implementing operators, but it is rarely used as a public API.
     *
     * @class Subscriber<T>
     */
    export class Subscriber<T> extends Subscription implements Observer<T> {
        /**
         * A static factory for a Subscriber, given a (potentially partial) definition
         * of an Observer.
         * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
         * @param {function(e: ?any): void} [error] The `error` callback of an
         * Observer.
         * @param {function(): void} [complete] The `complete` callback of an
         * Observer.
         * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
         * Observer represented by the given arguments.
         * @nocollapse
         */
        static create<T>(next?: (x?: T) => void, error?: (e?: any) => void, complete?: () => void): Subscriber<T>;
	/** @internal */ syncErrorValue: any;
	/** @internal */ syncErrorThrown: boolean;
	/** @internal */ syncErrorThrowable: boolean;
        protected isStopped: boolean;
        protected destination: PartialObserver<any>;
        /**
         * @param {Observer|function(value: T): void} [destinationOrNext] A partially
         * defined Observer or a `next` callback function.
         * @param {function(e: ?any): void} [error] The `error` callback of an
         * Observer.
         * @param {function(): void} [complete] The `complete` callback of an
         * Observer.
         */
        constructor(destinationOrNext?: PartialObserver<any> | ((value: T) => void), error?: (e?: any) => void, complete?: () => void);
        /**
         * The {@link Observer} callback to receive notifications of type `next` from
         * the Observable, with a value. The Observable may call this method 0 or more
         * times.
         * @param {T} [value] The `next` value.
         * @return {void}
         */
        next(value?: T): void;
        /**
         * The {@link Observer} callback to receive notifications of type `error` from
         * the Observable, with an attached {@link Error}. Notifies the Observer that
         * the Observable has experienced an error condition.
         * @param {any} [err] The `error` exception.
         * @return {void}
         */
        error(err?: any): void;
        /**
         * The {@link Observer} callback to receive a valueless notification of type
         * `complete` from the Observable. Notifies the Observer that the Observable
         * has finished sending push-based notifications.
         * @return {void}
         */
        complete(): void;
        unsubscribe(): void;
        protected _next(value: T): void;
        protected _error(err: any): void;
        protected _complete(): void;
        /** @deprecated This is an internal implementation detail, do not use. */
        _unsubscribeAndRecycle(): Subscriber<T>;
    }
    export interface Operator<T, R>
    {
        call(subscriber: Subscriber<R>, source: any): TeardownLogic;
    }
    /**
     * Decides at subscription time which Observable will actually be subscribed.
     *
     * <span class="informal">`If` statement for Observables.</span>
     *
     * `if` accepts a condition function and two Observables. When
     * an Observable returned by the operator is subscribed, condition function will be called.
     * Based on what boolean it returns at that moment, consumer will subscribe either to
     * the first Observable (if condition was true) or to the second (if condition was false). Condition
     * function may also not return anything - in that case condition will be evaluated as false and
     * second Observable will be subscribed.
     *
     * Note that Observables for both cases (true and false) are optional. If condition points to an Observable that
     * was left undefined, resulting stream will simply complete immediately. That allows you to, rather
     * then controlling which Observable will be subscribed, decide at runtime if consumer should have access
     * to given Observable or not.
     *
     * If you have more complex logic that requires decision between more than two Observables, {@link defer}
     * will probably be a better choice. Actually `if` can be easily implemented with {@link defer}
     * and exists only for convenience and readability reasons.
     *
     *
     * @example <caption>Change at runtime which Observable will be subscribed</caption>
     * let subscribeToFirst;
     * const firstOrSecond = Rx.Observable.if(
     *   () => subscribeToFirst,
     *   Rx.Observable.of('first'),
     *   Rx.Observable.of('second')
     * );
     *
     * subscribeToFirst = true;
     * firstOrSecond.subscribe(value => console.log(value));
     *
     * // Logs:
     * // "first"
     *
     * subscribeToFirst = false;
     * firstOrSecond.subscribe(value => console.log(value));
     *
     * // Logs:
     * // "second"
     *
     *
     * @example <caption>Control an access to an Observable</caption>
     * let accessGranted;
     * const observableIfYouHaveAccess = Rx.Observable.if(
     *   () => accessGranted,
     *   Rx.Observable.of('It seems you have an access...') // Note that only one Observable is passed to the operator.
     * );
     *
     * accessGranted = true;
     * observableIfYouHaveAccess.subscribe(
     *   value => console.log(value),
     *   err => {},
     *   () => console.log('The end')
     * );
     *
     * // Logs:
     * // "It seems you have an access..."
     * // "The end"
     *
     * accessGranted = false;
     * observableIfYouHaveAccess.subscribe(
     *   value => console.log(value),
     *   err => {},
     *   () => console.log('The end')
     * );
     *
     * // Logs:
     * // "The end"
     *
     * @see {@link defer}
     *
     * @param {function(): boolean} condition Condition which Observable should be chosen.
     * @param {Observable} [trueObservable] An Observable that will be subscribed if condition is true.
     * @param {Observable} [falseObservable] An Observable that will be subscribed if condition is false.
     * @return {Observable} Either first or second Observable, depending on condition.
     * @static true
     * @name iif
     * @owner Observable
     */
    export function iif<T, F>(condition: () => boolean, trueResult?: SubscribableOrPromise<T>, falseResult?: SubscribableOrPromise<F>): Observable<T | F>;
    /**
     * Creates an Observable that emits no items to the Observer and immediately
     * emits an error notification.
     *
     * <span class="informal">Just emits 'error', and nothing else.
     * </span>
     *
     * <img src="./img/throw.png" width="100%">
     *
     * This static operator is useful for creating a simple Observable that only
     * emits the error notification. It can be used for composing with other
     * Observables, such as in a {@link mergeMap}.
     *
     * @example <caption>Emit the number 7, then emit an error.</caption>
     * import { throwError, concat, of } from 'rxjs/create';
     *
     * const result = concat(of(7), throwError(new Error('oops!')));
     * result.subscribe(x => console.log(x), e => console.error(e));
     *
     * @example <caption>Map and flatten numbers to the sequence 'a', 'b', 'c', but throw an error for 13</caption>
     * import { throwError, interval, of } from 'rxjs/create';
     * import { mergeMap } from 'rxjs/operators';
     *
     * interval(1000).pipe(
     *   mergeMap(x => x === 13 ?
     *     throwError('Thirteens are bad') :
     *     of('a', 'b', 'c')
     *   )
     * ).subscribe(x => console.log(x), e => console.error(e));
     *
     * @see {@link create}
     * @see {@link empty}
     * @see {@link never}
     * @see {@link of}
     *
     * @param {any} error The particular Error to pass to the error notification.
     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling
     * the emission of the error notification.
     * @return {Observable} An error Observable: emits only the error notification
     * using the given error argument.
     * @static true
     * @name throw
     * @owner Observable
     */
    export function throwError(error: any, scheduler?: SchedulerLike): Observable<never>;
    /**
     * A representation of any set of values over any amount of time. This is the most basic building block
     * of RxJS.
     *
     * @class Observable<T>
     */
    export class Observable<T> implements Subscribable<T> {
        /** Internal implementation detail, do not use directly. */
        _isScalar: boolean;
        /** @deprecated This is an internal implementation detail, do not use. */
        source: Observable<any>;
        /** @deprecated This is an internal implementation detail, do not use. */
        operator: Operator<any, T>;
        /**
         * @constructor
         * @param {Function} subscribe the function that is called when the Observable is
         * initially subscribed to. This function is given a Subscriber, to which new values
         * can be `next`ed, or an `error` method can be called to raise an error, or
         * `complete` can be called to notify of a successful completion.
         */
        constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic);
        /**
         * Creates a new cold Observable by calling the Observable constructor
         * @static true
         * @owner Observable
         * @method create
         * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
         * @return {Observable} a new cold observable
         * @nocollapse
         */
        static create: Function;
        /**
         * Creates a new Observable, with this Observable as the source, and the passed
         * operator defined as the new observable's operator.
         * @method lift
         * @param {Operator} operator the operator defining the operation to take on the observable
         * @return {Observable} a new observable with the Operator applied
         */
        lift<R>(operator: Operator<T, R>): Observable<R>;
        subscribe(observer?: PartialObserver<T>): Subscription;
        subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
        /** @deprecated This is an internal implementation detail, do not use. */
        _trySubscribe(sink: Subscriber<T>): TeardownLogic;
        /**
         * @method forEach
         * @param {Function} next a handler for each value emitted by the observable
         * @param {PromiseConstructor} [promiseCtor] a constructor function used to instantiate the Promise
         * @return {Promise} a promise that either resolves on observable completion or
         *  rejects with the handled error
         */
        forEach(next: (value: T) => void, promiseCtor?: PromiseConstructorLike): Promise<void>;
        /** @deprecated This is an internal implementation detail, do not use. */
        _subscribe(subscriber: Subscriber<any>): TeardownLogic;
        /**
         * @nocollapse
         * @deprecated In favor of iif creation function: import { iif } from 'rxjs';
         */
        static if: typeof iif;
        /**
         * @nocollapse
         * @deprecated In favor of throwError creation function: import { throwError } from 'rxjs';
         */
        static throw: typeof throwError;
        pipe(): Observable<T>;
        pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
        pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
        pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
        pipe<A, B, C, D>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): Observable<D>;
        pipe<A, B, C, D, E>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): Observable<E>;
        pipe<A, B, C, D, E, F>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): Observable<F>;
        pipe<A, B, C, D, E, F, G>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): Observable<G>;
        pipe<A, B, C, D, E, F, G, H>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): Observable<H>;
        pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>): Observable<I>;
        pipe<R>(...operations: OperatorFunction<T, R>[]): Observable<R>;
        toPromise<T>(this: Observable<T>): Promise<T>;
        toPromise<T>(this: Observable<T>, PromiseCtor: typeof Promise): Promise<T>;
        toPromise<T>(this: Observable<T>, PromiseCtor: PromiseConstructorLike): Promise<T>;
    }
    /**
     * @class Subject<T>
     */
    export class Subject<T> extends Observable<T> implements SubscriptionLike
    {
        observers: Observer<T>[];
        closed: boolean;
        isStopped: boolean;
        hasError: boolean;
        thrownError: any;
        constructor();
        /**@nocollapse */
        static create: Function;
        lift<R>(operator: Operator<T, R>): Observable<R>;
        next(value?: T): void;
        error(err: any): void;
        complete(): void;
        unsubscribe(): void;
        /** @deprecated This is an internal implementation detail, do not use. */
        _trySubscribe(subscriber: Subscriber<T>): TeardownLogic;
        /** @deprecated This is an internal implementation detail, do not use. */
        _subscribe(subscriber: Subscriber<T>): Subscription;
        asObservable(): Observable<T>;
    }
    /**
     * @class ConnectableObservable<T>
     */
    export class ConnectableObservable<T> extends Observable<T> {
        source: Observable<T>;
        protected subjectFactory: () => Subject<T>;
        protected _subject: Subject<T>;
        protected _refCount: number;
        protected _connection: Subscription;
        /** @internal */
        _isComplete: boolean;
        constructor(source: Observable<T>, subjectFactory: () => Subject<T>);
        /** @deprecated This is an internal implementation detail, do not use. */
        _subscribe(subscriber: Subscriber<T>): Subscription;
        protected getSubject(): Subject<T>;
        connect(): Subscription;
        refCount(): Observable<T>;
    }
    export interface RefCountSubscription
    {
        count: number;
        unsubscribe: () => void;
        closed: boolean;
        attemptedToUnsubscribe: boolean;
    }
    /**
     * An Observable representing values belonging to the same group represented by
     * a common key. The values emitted by a GroupedObservable come from the source
     * Observable. The common key is available as the field `key` on a
     * GroupedObservable instance.
     *
     * @class GroupedObservable<K, T>
     */
    export class GroupedObservable<K, T> extends Observable<T> {
        key: K;
        private groupSubject;
        private refCountSubscription;
        /** @deprecated Do not construct this type. Internal use only */
        constructor(key: K, groupSubject: Subject<T>, refCountSubscription?: RefCountSubscription);
        /** @deprecated This is an internal implementation detail, do not use. */
        _subscribe(subscriber: Subscriber<T>): Subscription;
    }


    /** Symbol.observable or a string "@@observable". Used for interop */
    export const observable: string | symbol;
    /**
     * @class BehaviorSubject<T>
     */
    export class BehaviorSubject<T> extends Subject<T> {
        private _value;
        constructor(_value: T);
        readonly value: T;
        /** @deprecated This is an internal implementation detail, do not use. */
        _subscribe(subscriber: Subscriber<T>): Subscription;
        getValue(): T;
        next(value: T): void;
    }
    /**
     * @class ReplaySubject<T>
     */
    export class ReplaySubject<T> extends Subject<T> {
        private scheduler;
        private _events;
        private _bufferSize;
        private _windowTime;
        private _infiniteTimeWindow;
        constructor(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike);
        private nextInfiniteTimeWindow(value);
        private nextTimeWindow(value);
        /** @deprecated This is an internal implementation detail, do not use. */
        _subscribe(subscriber: Subscriber<T>): Subscription;
        _getNow(): number;
        private _trimBufferThenGetEvents();
    }
    /**
     * @class AsyncSubject<T>
     */
    export class AsyncSubject<T> extends Subject<T> {
        private value;
        private hasNext;
        private hasCompleted;
        /** @deprecated This is an internal implementation detail, do not use. */
        _subscribe(subscriber: Subscriber<any>): Subscription;
        next(value: T): void;
        error(error: any): void;
        complete(): void;
    }
    /**
     * An execution context and a data structure to order tasks and schedule their
     * execution. Provides a notion of (potentially virtual) time, through the
     * `now()` getter method.
     *
     * Each unit of work in a Scheduler is called an {@link Action}.
     *
     * ```ts
     * class Scheduler {
     *   now(): number;
     *   schedule(work, delay?, state?): Subscription;
     * }
     * ```
     *
     * @class Scheduler
     * @deprecated Scheduler is an internal implementation detail of RxJS, and
     * should not be used directly. Rather, create your own class and implement
     * {@link SchedulerLike}
     */
    export class Scheduler implements SchedulerLike
    {
        private SchedulerAction;
        /** @nocollapse */
        static now: () => number;
        constructor(SchedulerAction: typeof Action, now?: () => number);
        /**
         * A getter method that returns a number representing the current time
         * (at the time this function was called) according to the scheduler's own
         * internal clock.
         * @return {number} A number that represents the current time. May or may not
         * have a relation to wall-clock time. May or may not refer to a time unit
         * (e.g. milliseconds).
         */
        now: () => number;
        /**
         * Schedules a function, `work`, for execution. May happen at some point in
         * the future, according to the `delay` parameter, if specified. May be passed
         * some context object, `state`, which will be passed to the `work` function.
         *
         * The given arguments will be processed an stored as an Action object in a
         * queue of actions.
         *
         * @param {function(state: ?T): ?Subscription} work A function representing a
         * task, or some unit of work to be executed by the Scheduler.
         * @param {number} [delay] Time to wait before executing the work, where the
         * time unit is implicit and defined by the Scheduler itself.
         * @param {T} [state] Some contextual data that the `work` function uses when
         * called by the Scheduler.
         * @return {Subscription} A subscription in order to be able to unsubscribe
         * the scheduled work.
         */
        schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
    }
    export class Action<T> extends Subscription
    {
        constructor(scheduler: Scheduler, work: (this: SchedulerAction<T>, state?: T) => void);
        /**
         * Schedules this action on its parent Scheduler for execution. May be passed
         * some context object, `state`. May happen at some point in the future,
         * according to the `delay` parameter, if specified.
         * @param {T} [state] Some contextual data that the `work` function uses when
         * called by the Scheduler.
         * @param {number} [delay] Time to wait before executing the work, where the
         * time unit is implicit and defined by the Scheduler.
         * @return {void}
         */
        schedule(state?: T, delay?: number): Subscription;
    }
    export class AsyncScheduler extends Scheduler
    {
        static delegate?: Scheduler;
        actions: Array<AsyncAction<any>>;
        /**
         * A flag to indicate whether the Scheduler is currently executing a batch of
         * queued actions.
         * @type {boolean}
         * @deprecated internal use only
         */
        active: boolean;
        /**
         * An internal ID used to track the latest asynchronous task such as those
         * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
         * others.
         * @type {any}
         * @deprecated internal use only
         */
        scheduled: any;
        constructor(SchedulerAction: typeof Action, now?: () => number);
        schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
        flush(action: AsyncAction<any>): void;
    }
    export class AsyncAction<T> extends Action<T> {
        protected scheduler: AsyncScheduler;
        protected work: (this: SchedulerAction<T>, state?: T) => void;
        id: any;
        state: T;
        delay: number;
        protected pending: boolean;
        constructor(scheduler: AsyncScheduler, work: (this: SchedulerAction<T>, state?: T) => void);
        schedule(state?: T, delay?: number): Subscription;
        protected requestAsyncId(scheduler: AsyncScheduler, id?: any, delay?: number): any;
        protected recycleAsyncId(scheduler: AsyncScheduler, id: any, delay?: number): any;
        /**
         * Immediately executes this action and the `work` it contains.
         * @return {any}
         */
        execute(state: T, delay: number): any;
        protected _execute(state: T, delay: number): any;
        /** @deprecated This is an internal implementation detail, do not use. */
        _unsubscribe(): void;
    }
    export class AsapScheduler extends AsyncScheduler
    {
        flush(action?: AsyncAction<any>): void;
    }
    /**
     *
     * Asap Scheduler
     *
     * <span class="informal">Perform task as fast as it can be performed asynchronously</span>
     *
     * `asap` scheduler behaves the same as {@link async} scheduler when you use it to delay task
     * in time. If however you set delay to `0`, `asap` will wait for current synchronously executing
     * code to end and then it will try to execute given task as fast as possible.
     *
     * `asap` scheduler will do its best to minimize time between end of currently executing code
     * and start of scheduled task. This makes it best candidate for performing so called "deferring".
     * Traditionally this was achieved by calling `setTimeout(deferredTask, 0)`, but that technique involves
     * some (although minimal) unwanted delay.
     *
     * Note that using `asap` scheduler does not necessarily mean that your task will be first to process
     * after currently executing code. In particular, if some task was also scheduled with `asap` before,
     * that task will execute first. That being said, if you need to schedule task asynchronously, but
     * as soon as possible, `asap` scheduler is your best bet.
     *
     * @example <caption>Compare async and asap scheduler</caption>
     *
     * Rx.Scheduler.async.schedule(() => console.log('async')); // scheduling 'async' first...
     * Rx.Scheduler.asap.schedule(() => console.log('asap'));
     *
     * // Logs:
     * // "asap"
     * // "async"
     * // ... but 'asap' goes first!
     *
     * @static true
     * @name asap
     * @owner Scheduler
     */
    export const asap: AsapScheduler;
    /**
     *
     * Async Scheduler
     *
     * <span class="informal">Schedule task as if you used setTimeout(task, duration)</span>
     *
     * `async` scheduler schedules tasks asynchronously, by putting them on the JavaScript
     * event loop queue. It is best used to delay tasks in time or to schedule tasks repeating
     * in intervals.
     *
     * If you just want to "defer" task, that is to perform it right after currently
     * executing synchronous code ends (commonly achieved by `setTimeout(deferredTask, 0)`),
     * better choice will be the {@link asap} scheduler.
     *
     * @example <caption>Use async scheduler to delay task</caption>
     * const task = () => console.log('it works!');
     *
     * Rx.Scheduler.async.schedule(task, 2000);
     *
     * // After 2 seconds logs:
     * // "it works!"
     *
     *
     * @example <caption>Use async scheduler to repeat task in intervals</caption>
     * function task(state) {
     *   console.log(state);
     *   this.schedule(state + 1, 1000); // `this` references currently executing Action,
     *                                   // which we reschedule with new state and delay
     * }
     *
     * Rx.Scheduler.async.schedule(task, 3000, 0);
     *
     * // Logs:
     * // 0 after 3s
     * // 1 after 4s
     * // 2 after 5s
     * // 3 after 6s
     *
     * @static true
     * @name async
     * @owner Scheduler
     */
    export const async: AsyncScheduler;
    export class QueueScheduler extends AsyncScheduler
    {
    }
    /**
     *
     * Queue Scheduler
     *
     * <span class="informal">Put every next task on a queue, instead of executing it immediately</span>
     *
     * `queue` scheduler, when used with delay, behaves the same as {@link async} scheduler.
     *
     * When used without delay, it schedules given task synchronously - executes it right when
     * it is scheduled. However when called recursively, that is when inside the scheduled task,
     * another task is scheduled with queue scheduler, instead of executing immediately as well,
     * that task will be put on a queue and wait for current one to finish.
     *
     * This means that when you execute task with `queue` scheduler, you are sure it will end
     * before any other task scheduled with that scheduler will start.
     *
     * @examples <caption>Schedule recursively first, then do something</caption>
     *
     * Rx.Scheduler.queue.schedule(() => {
     *   Rx.Scheduler.queue.schedule(() => console.log('second')); // will not happen now, but will be put on a queue
     *
     *   console.log('first');
     * });
     *
     * // Logs:
     * // "first"
     * // "second"
     *
     *
     * @example <caption>Reschedule itself recursively</caption>
     *
     * Rx.Scheduler.queue.schedule(function(state) {
     *   if (state !== 0) {
     *     console.log('before', state);
     *     this.schedule(state - 1); // `this` references currently executing Action,
     *                               // which we reschedule with new state
     *     console.log('after', state);
     *   }
     * }, 0, 3);
     *
     * // In scheduler that runs recursively, you would expect:
     * // "before", 3
     * // "before", 2
     * // "before", 1
     * // "after", 1
     * // "after", 2
     * // "after", 3
     *
     * // But with queue it logs:
     * // "before", 3
     * // "after", 3
     * // "before", 2
     * // "after", 2
     * // "before", 1
     * // "after", 1
     *
     *
     * @static true
     * @name queue
     * @owner Scheduler
     */
    export const queue: QueueScheduler;
    export class AnimationFrameScheduler extends AsyncScheduler
    {
        flush(action?: AsyncAction<any>): void;
    }
    /**
     *
     * Animation Frame Scheduler
     *
     * <span class="informal">Perform task when `window.requestAnimationFrame` would fire</span>
     *
     * When `animationFrame` scheduler is used with delay, it will fall back to {@link async} scheduler
     * behaviour.
     *
     * Without delay, `animationFrame` scheduler can be used to create smooth browser animations.
     * It makes sure scheduled task will happen just before next browser content repaint,
     * thus performing animations as efficiently as possible.
     *
     * @example <caption>Schedule div height animation</caption>
     * const div = document.querySelector('.some-div');
     *
     * Rx.Scheduler.animationFrame.schedule(function(height) {
     *   div.style.height = height + "px";
     *
     *   this.schedule(height + 1);  // `this` references currently executing Action,
     *                               // which we reschedule with new state
     * }, 0, 0);
     *
     * // You will see .some-div element growing in height
     *
     *
     * @static true
     * @name animationFrame
     * @owner Scheduler
     */
    export const animationFrame: AnimationFrameScheduler;
    export class VirtualTimeScheduler extends AsyncScheduler
    {
        maxFrames: number;
        protected static frameTimeFactor: number;
        frame: number;
        index: number;
        constructor(SchedulerAction?: typeof AsyncAction, maxFrames?: number);
        /**
         * Prompt the Scheduler to execute all of its queued actions, therefore
         * clearing its queue.
         * @return {void}
         */
        flush(): void;
    }
    /**
     * We need this JSDoc comment for affecting ESDoc.
     * @ignore
     * @extends {Ignored}
     */
    export class VirtualAction<T> extends AsyncAction<T> {
        protected scheduler: VirtualTimeScheduler;
        protected work: (this: SchedulerAction<T>, state?: T) => void;
        protected index: number;
        protected active: boolean;
        constructor(scheduler: VirtualTimeScheduler, work: (this: SchedulerAction<T>, state?: T) => void, index?: number);
        schedule(state?: T, delay?: number): Subscription;
        protected requestAsyncId(scheduler: VirtualTimeScheduler, id?: any, delay?: number): any;
        protected recycleAsyncId(scheduler: VirtualTimeScheduler, id?: any, delay?: number): any;
        protected _execute(state: T, delay: number): any;
        static sortActions<T>(a: VirtualAction<T>, b: VirtualAction<T>): 1 | -1 | 0;
    }
    /**
     * Represents a push-based event or value that an {@link Observable} can emit.
     * This class is particularly useful for operators that manage notifications,
     * like {@link materialize}, {@link dematerialize}, {@link observeOn}, and
     * others. Besides wrapping the actual delivered value, it also annotates it
     * with metadata of, for instance, what type of push message it is (`next`,
     * `error`, or `complete`).
     *
     * @see {@link materialize}
     * @see {@link dematerialize}
     * @see {@link observeOn}
     *
     * @class Notification<T>
     */
    export class Notification<T> {
        kind: string;
        value: T;
        error: any;
        hasValue: boolean;
        constructor(kind: string, value?: T, error?: any);
        /**
         * Delivers to the given `observer` the value wrapped by this Notification.
         * @param {Observer} observer
         * @return
         */
        observe(observer: PartialObserver<T>): any;
        /**
         * Given some {@link Observer} callbacks, deliver the value represented by the
         * current Notification to the correctly corresponding callback.
         * @param {function(value: T): void} next An Observer `next` callback.
         * @param {function(err: any): void} [error] An Observer `error` callback.
         * @param {function(): void} [complete] An Observer `complete` callback.
         * @return {any}
         */
        do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): any;
        /**
         * Takes an Observer or its individual callback functions, and calls `observe`
         * or `do` methods accordingly.
         * @param {Observer|function(value: T): void} nextOrObserver An Observer or
         * the `next` callback.
         * @param {function(err: any): void} [error] An Observer `error` callback.
         * @param {function(): void} [complete] An Observer `complete` callback.
         * @return {any}
         */
        accept(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void): any;
        /**
         * Returns a simple Observable that just delivers the notification represented
         * by this Notification instance.
         * @return {any}
         */
        toObservable(): Observable<T>;
        private static completeNotification;
        private static undefinedValueNotification;
        /**
         * A shortcut to create a Notification instance of the type `next` from a
         * given value.
         * @param {T} value The `next` value.
         * @return {Notification<T>} The "next" Notification representing the
         * argument.
         * @nocollapse
         */
        static createNext<T>(value: T): Notification<T>;
        /**
         * A shortcut to create a Notification instance of the type `error` from a
         * given error.
         * @param {any} [err] The `error` error.
         * @return {Notification<T>} The "error" Notification representing the
         * argument.
         * @nocollapse
         */
        static createError<T>(err?: any): Notification<T>;
        /**
         * A shortcut to create a Notification instance of the type `complete`.
         * @return {Notification<any>} The valueless "complete" Notification.
         * @nocollapse
         */
        static createComplete(): Notification<any>;
    }
    export function pipe<T>(): UnaryFunction<T, T>;
    export function pipe<T, A>(op1: UnaryFunction<T, A>): UnaryFunction<T, A>;
    export function pipe<T, A, B>(op1: UnaryFunction<T, A>, op2: UnaryFunction<A, B>): UnaryFunction<T, B>;
    export function pipe<T, A, B, C>(op1: UnaryFunction<T, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>): UnaryFunction<T, C>;
    export function pipe<T, A, B, C, D>(op1: UnaryFunction<T, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>): UnaryFunction<T, D>;
    export function pipe<T, A, B, C, D, E>(op1: UnaryFunction<T, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>): UnaryFunction<T, E>;
    export function pipe<T, A, B, C, D, E, F>(op1: UnaryFunction<T, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>, op6: UnaryFunction<E, F>): UnaryFunction<T, F>;
    export function pipe<T, A, B, C, D, E, F, G>(op1: UnaryFunction<T, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>, op6: UnaryFunction<E, F>, op7: UnaryFunction<F, G>): UnaryFunction<T, G>;
    export function pipe<T, A, B, C, D, E, F, G, H>(op1: UnaryFunction<T, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>, op6: UnaryFunction<E, F>, op7: UnaryFunction<F, G>, op8: UnaryFunction<G, H>): UnaryFunction<T, H>;
    export function pipe<T, A, B, C, D, E, F, G, H, I>(op1: UnaryFunction<T, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>, op6: UnaryFunction<E, F>, op7: UnaryFunction<F, G>, op8: UnaryFunction<G, H>, op9: UnaryFunction<H, I>): UnaryFunction<T, I>;
    export function noop(): void;
    export function identity<T>(x: T): T;
    /**
     * Tests to see if the object is an RxJS {@link Observable}
     * @param obj the object to test
     */
    export function isObservable<T>(obj: any): obj is Observable<T>;
    /**
     * An error thrown when an element was queried at a certain index of an
     * Observable, but no such index or position exists in that sequence.
     *
     * @see {@link elementAt}
     * @see {@link take}
     * @see {@link takeLast}
     *
     * @class ArgumentOutOfRangeError
     */
    export class ArgumentOutOfRangeError extends Error
    {
        constructor();
    }
    /**
     * An error thrown when an Observable or a sequence was queried but has no
     * elements.
     *
     * @see {@link first}
     * @see {@link last}
     * @see {@link single}
     *
     * @class EmptyError
     */
    export class EmptyError extends Error
    {
        constructor();
    }
    /**
     * An error thrown when an action is invalid because the object has been
     * unsubscribed.
     *
     * @see {@link Subject}
     * @see {@link BehaviorSubject}
     *
     * @class ObjectUnsubscribedError
     */
    export class ObjectUnsubscribedError extends Error
    {
        constructor();
    }
    /**
     * An error thrown when one or more errors have occurred during the
     * `unsubscribe` of a {@link Subscription}.
     */
    export class UnsubscriptionError extends Error
    {
        errors: any[];
        constructor(errors: any[]);
    }
    /**
     * An error thrown when duetime elapses.
     *
     * @see {@link timeout}
     *
     * @class TimeoutError
     */
    export class TimeoutError extends Error
    {
        constructor();
    }
    /** @deprecated resultSelector is no longer supported, use a mapping function. */
    export function bindCallback(callbackFunc: Function, resultSelector: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
    export function bindCallback<R1, R2, R3, R4>(callbackFunc: (callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): () => Observable<any[]>;
    export function bindCallback<R1, R2, R3>(callbackFunc: (callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): () => Observable<[R1, R2, R3]>;
    export function bindCallback<R1, R2>(callbackFunc: (callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): () => Observable<[R1, R2]>;
    export function bindCallback<R1>(callbackFunc: (callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): () => Observable<R1>;
    export function bindCallback(callbackFunc: (callback: () => any) => any, scheduler?: SchedulerLike): () => Observable<void>;
    export function bindCallback<A1, R1, R2, R3, R4>(callbackFunc: (arg1: A1, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<any[]>;
    export function bindCallback<A1, R1, R2, R3>(callbackFunc: (arg1: A1, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<[R1, R2, R3]>;
    export function bindCallback<A1, R1, R2>(callbackFunc: (arg1: A1, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<[R1, R2]>;
    export function bindCallback<A1, R1>(callbackFunc: (arg1: A1, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<R1>;
    export function bindCallback<A1>(callbackFunc: (arg1: A1, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<void>;
    export function bindCallback<A1, A2, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<any[]>;
    export function bindCallback<A1, A2, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<[R1, R2, R3]>;
    export function bindCallback<A1, A2, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<[R1, R2]>;
    export function bindCallback<A1, A2, R1>(callbackFunc: (arg1: A1, arg2: A2, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<R1>;
    export function bindCallback<A1, A2>(callbackFunc: (arg1: A1, arg2: A2, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<void>;
    export function bindCallback<A1, A2, A3, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<any[]>;
    export function bindCallback<A1, A2, A3, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2, R3]>;
    export function bindCallback<A1, A2, A3, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2]>;
    export function bindCallback<A1, A2, A3, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<R1>;
    export function bindCallback<A1, A2, A3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<void>;
    export function bindCallback<A1, A2, A3, A4, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<any[]>;
    export function bindCallback<A1, A2, A3, A4, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2, R3]>;
    export function bindCallback<A1, A2, A3, A4, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2]>;
    export function bindCallback<A1, A2, A3, A4, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<R1>;
    export function bindCallback<A1, A2, A3, A4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<void>;
    export function bindCallback<A1, A2, A3, A4, A5, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<any[]>;
    export function bindCallback<A1, A2, A3, A4, A5, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2, R3]>;
    export function bindCallback<A1, A2, A3, A4, A5, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2]>;
    export function bindCallback<A1, A2, A3, A4, A5, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<R1>;
    export function bindCallback<A1, A2, A3, A4, A5>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<void>;
    export function bindCallback<A, R>(callbackFunc: (...args: Array<A | ((result: R) => any)>) => any, scheduler?: SchedulerLike): (...args: A[]) => Observable<R>;
    export function bindCallback<A, R>(callbackFunc: (...args: Array<A | ((...results: R[]) => any)>) => any, scheduler?: SchedulerLike): (...args: A[]) => Observable<R[]>;
    export function bindCallback(callbackFunc: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
    /** @deprecated resultSelector is deprecated, pipe to map instead */
    export function bindNodeCallback(callbackFunc: Function, resultSelector: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
    export function bindNodeCallback<R1, R2, R3, R4>(callbackFunc: (callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
    export function bindNodeCallback<R1, R2, R3>(callbackFunc: (callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): () => Observable<[R1, R2, R3]>;
    export function bindNodeCallback<R1, R2>(callbackFunc: (callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): () => Observable<[R1, R2]>;
    export function bindNodeCallback<R1>(callbackFunc: (callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): () => Observable<R1>;
    export function bindNodeCallback(callbackFunc: (callback: (err: any) => any) => any, scheduler?: SchedulerLike): () => Observable<void>;
    export function bindNodeCallback<A1, R1, R2, R3, R4>(callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
    export function bindNodeCallback<A1, R1, R2, R3>(callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<[R1, R2, R3]>;
    export function bindNodeCallback<A1, R1, R2>(callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<[R1, R2]>;
    export function bindNodeCallback<A1, R1>(callbackFunc: (arg1: A1, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<R1>;
    export function bindNodeCallback<A1>(callbackFunc: (arg1: A1, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<void>;
    export function bindNodeCallback<A1, A2, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
    export function bindNodeCallback<A1, A2, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<[R1, R2, R3]>;
    export function bindNodeCallback<A1, A2, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<[R1, R2]>;
    export function bindNodeCallback<A1, A2, R1>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<R1>;
    export function bindNodeCallback<A1, A2>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<void>;
    export function bindNodeCallback<A1, A2, A3, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
    export function bindNodeCallback<A1, A2, A3, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2, R3]>;
    export function bindNodeCallback<A1, A2, A3, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2]>;
    export function bindNodeCallback<A1, A2, A3, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<R1>;
    export function bindNodeCallback<A1, A2, A3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<void>;
    export function bindNodeCallback<A1, A2, A3, A4, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
    export function bindNodeCallback<A1, A2, A3, A4, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2, R3]>;
    export function bindNodeCallback<A1, A2, A3, A4, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2]>;
    export function bindNodeCallback<A1, A2, A3, A4, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<R1>;
    export function bindNodeCallback<A1, A2, A3, A4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<void>;
    export function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
    export function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2, R3]>;
    export function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2]>;
    export function bindNodeCallback<A1, A2, A3, A4, A5, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<R1>;
    export function bindNodeCallback<A1, A2, A3, A4, A5>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<void>;
    export function bindNodeCallback(callbackFunc: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function combineLatest<T, R>(v1: ObservableInput<T>, resultSelector: (v1: T) => R, scheduler?: SchedulerLike): Observable<R>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function combineLatest<T, T2, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, resultSelector: (v1: T, v2: T2) => R, scheduler?: SchedulerLike): Observable<R>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function combineLatest<T, T2, T3, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => R, scheduler?: SchedulerLike): Observable<R>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function combineLatest<T, T2, T3, T4, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => R, scheduler?: SchedulerLike): Observable<R>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function combineLatest<T, T2, T3, T4, T5, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R, scheduler?: SchedulerLike): Observable<R>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function combineLatest<T, T2, T3, T4, T5, T6, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R, scheduler?: SchedulerLike): Observable<R>;
    export function combineLatest<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: SchedulerLike): Observable<[T, T2]>;
    export function combineLatest<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): Observable<[T, T2, T3]>;
    export function combineLatest<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): Observable<[T, T2, T3, T4]>;
    export function combineLatest<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): Observable<[T, T2, T3, T4, T5]>;
    export function combineLatest<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): Observable<[T, T2, T3, T4, T5, T6]>;
    export function combineLatest<T>(array: ObservableInput<T>[], scheduler?: SchedulerLike): Observable<T[]>;
    export function combineLatest<R>(array: ObservableInput<any>[], scheduler?: SchedulerLike): Observable<R>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function combineLatest<T, R>(array: ObservableInput<T>[], resultSelector: (...values: Array<T>) => R, scheduler?: SchedulerLike): Observable<R>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function combineLatest<R>(array: ObservableInput<any>[], resultSelector: (...values: Array<any>) => R, scheduler?: SchedulerLike): Observable<R>;
    export function combineLatest<T>(...observables: Array<ObservableInput<T> | SchedulerLike>): Observable<T[]>;
    export function combineLatest<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R) | SchedulerLike>): Observable<R>;
    export function combineLatest<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R) | SchedulerLike>): Observable<R>;
    export function concat<T>(v1: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T>;
    export function concat<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: SchedulerLike): Observable<T | T2>;
    export function concat<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
    export function concat<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
    export function concat<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
    export function concat<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
    export function concat<T>(...observables: (ObservableInput<T> | SchedulerLike)[]): Observable<T>;
    export function concat<T, R>(...observables: (ObservableInput<any> | SchedulerLike)[]): Observable<R>;
    /**
     * Creates an Observable that, on subscribe, calls an Observable factory to
     * make an Observable for each new Observer.
     *
     * <span class="informal">Creates the Observable lazily, that is, only when it
     * is subscribed.
     * </span>
     *
     * <img src="./img/defer.png" width="100%">
     *
     * `defer` allows you to create the Observable only when the Observer
     * subscribes, and create a fresh Observable for each Observer. It waits until
     * an Observer subscribes to it, and then it generates an Observable,
     * typically with an Observable factory function. It does this afresh for each
     * subscriber, so although each subscriber may think it is subscribing to the
     * same Observable, in fact each subscriber gets its own individual
     * Observable.
     *
     * @example <caption>Subscribe to either an Observable of clicks or an Observable of interval, at random</caption>
     * var clicksOrInterval = Rx.Observable.defer(function () {
     *   if (Math.random() > 0.5) {
     *     return Rx.Observable.fromEvent(document, 'click');
     *   } else {
     *     return Rx.Observable.interval(1000);
     *   }
     * });
     * clicksOrInterval.subscribe(x => console.log(x));
     *
     * // Results in the following behavior:
     * // If the result of Math.random() is greater than 0.5 it will listen
     * // for clicks anywhere on the "document"; when document is clicked it
     * // will log a MouseEvent object to the console. If the result is less
     * // than 0.5 it will emit ascending numbers, one every second(1000ms).
     *
     * @see {@link create}
     *
     * @param {function(): SubscribableOrPromise} observableFactory The Observable
     * factory function to invoke for each Observer that subscribes to the output
     * Observable. May also return a Promise, which will be converted on the fly
     * to an Observable.
     * @return {Observable} An Observable whose Observers' subscriptions trigger
     * an invocation of the given Observable factory function.
     * @static true
     * @name defer
     * @owner Observable
     */
    export function defer<T>(observableFactory: () => SubscribableOrPromise<T> | void): Observable<T>;
    /**
     * The same Observable instance returned by any call to {@link empty} without a
     * {@link Scheduler}. It is preferrable to use this over `empty()`.
     */
    export const EMPTY: Observable<never>;
    /**
     * Creates an Observable that emits no items to the Observer and immediately
     * emits a complete notification.
     *
     * <span class="informal">Just emits 'complete', and nothing else.
     * </span>
     *
     * <img src="./img/empty.png" width="100%">
     *
     * This static operator is useful for creating a simple Observable that only
     * emits the complete notification. It can be used for composing with other
     * Observables, such as in a {@link mergeMap}.
     *
     * @example <caption>Emit the number 7, then complete.</caption>
     * var result = Rx.Observable.empty().startWith(7);
     * result.subscribe(x => console.log(x));
     *
     * @example <caption>Map and flatten only odd numbers to the sequence 'a', 'b', 'c'</caption>
     * var interval = Rx.Observable.interval(1000);
     * var result = interval.mergeMap(x =>
     *   x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.empty()
     * );
     * result.subscribe(x => console.log(x));
     *
     * // Results in the following to the console:
     * // x is equal to the count on the interval eg(0,1,2,3,...)
     * // x will occur every 1000ms
     * // if x % 2 is equal to 1 print abc
     * // if x % 2 is not equal to 1 nothing will be output
     *
     * @see {@link create}
     * @see {@link never}
     * @see {@link of}
     * @see {@link throw}
     *
     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling
     * the emission of the complete notification.
     * @return {Observable} An "empty" Observable: emits only the complete
     * notification.
     * @static true
     * @name empty
     * @owner Observable
     * @deprecated Deprecated in favor of using EMPTY constant.
     */
    export function empty(scheduler?: SchedulerLike): Observable<never>;
    export function forkJoin<T>(sources: [ObservableInput<T>]): Observable<T[]>;
    export function forkJoin<T, T2>(sources: [ObservableInput<T>, ObservableInput<T2>]): Observable<[T, T2]>;
    export function forkJoin<T, T2, T3>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>]): Observable<[T, T2, T3]>;
    export function forkJoin<T, T2, T3, T4>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>]): Observable<[T, T2, T3, T4]>;
    export function forkJoin<T, T2, T3, T4, T5>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>]): Observable<[T, T2, T3, T4, T5]>;
    export function forkJoin<T, T2, T3, T4, T5, T6>(sources: [ObservableInput<T>, ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>, ObservableInput<T6>]): Observable<[T, T2, T3, T4, T5, T6]>;
    export function forkJoin<T>(sources: Array<ObservableInput<T>>): Observable<T[]>;
    export function forkJoin<T>(v1: ObservableInput<T>): Observable<T[]>;
    export function forkJoin<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
    export function forkJoin<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
    export function forkJoin<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
    export function forkJoin<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
    export function forkJoin<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
    /** @deprecated resultSelector is deprecated, pipe to map instead */
    export function forkJoin(...args: Array<ObservableInput<any> | Function>): Observable<any>;
    export function forkJoin<T>(...sources: ObservableInput<T>[]): Observable<T[]>;
    export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T>;
    export function from<T>(input: ObservableInput<ObservableInput<T>>, scheduler?: SchedulerLike): Observable<Observable<T>>;
    export interface NodeStyleEventEmitter
    {
        addListener: (eventName: string | symbol, handler: NodeEventHandler) => this;
        removeListener: (eventName: string | symbol, handler: NodeEventHandler) => this;
    }
    export type NodeEventHandler = (...args: any[]) => void;
    export interface JQueryStyleEventEmitter
    {
        on: (eventName: string, handler: Function) => void;
        off: (eventName: string, handler: Function) => void;
    }
    export interface HasEventTargetAddRemove<E>
    {
        addEventListener(type: string, listener: ((evt: E) => void) | null, options?: boolean | AddEventListenerOptions): void;
        removeEventListener(type: string, listener?: ((evt: E) => void) | null, options?: EventListenerOptions | boolean): void;
    }
    export type EventTargetLike<T> = HasEventTargetAddRemove<T> | NodeStyleEventEmitter | JQueryStyleEventEmitter;
    export type FromEventTarget<T> = EventTargetLike<T> | ArrayLike<EventTargetLike<T>>;
    export interface EventListenerOptions
    {
        capture?: boolean;
        passive?: boolean;
        once?: boolean;
    }
    export interface AddEventListenerOptions extends EventListenerOptions
    {
        once?: boolean;
        passive?: boolean;
    }
    export function fromEvent<T>(target: FromEventTarget<T>, eventName: string): Observable<T>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function fromEvent<T>(target: FromEventTarget<T>, eventName: string, resultSelector: (...args: any[]) => T): Observable<T>;
    export function fromEvent<T>(target: FromEventTarget<T>, eventName: string, options: EventListenerOptions): Observable<T>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function fromEvent<T>(target: FromEventTarget<T>, eventName: string, options: EventListenerOptions, resultSelector: (...args: any[]) => T): Observable<T>;
    export function fromEventPattern<T>(addHandler: (handler: Function) => any, removeHandler?: (handler: Function, signal?: any) => void): Observable<T>;
    /** @deprecated resultSelector no longer supported, pipe to map instead */
    export function fromEventPattern<T>(addHandler: (handler: Function) => any, removeHandler?: (handler: Function, signal?: any) => void, resultSelector?: (...args: any[]) => T): Observable<T>;
    export type ConditionFunc<S> = (state: S) => boolean;
    export type IterateFunc<S> = (state: S) => S;
    export type ResultFunc<S, T> = (state: S) => T;
    export interface GenerateBaseOptions<S>
    {
        /**
         * Initial state.
         */
        initialState: S;
        /**
         * Condition function that accepts state and returns boolean.
         * When it returns false, the generator stops.
         * If not specified, a generator never stops.
         */
        condition?: ConditionFunc<S>;
        /**
         * Iterate function that accepts state and returns new state.
         */
        iterate: IterateFunc<S>;
        /**
         * SchedulerLike to use for generation process.
         * By default, a generator starts immediately.
         */
        scheduler?: SchedulerLike;
    }
    export interface GenerateOptions<T, S> extends GenerateBaseOptions<S>
    {
        /**
         * Result selection function that accepts state and returns a value to emit.
         */
        resultSelector: ResultFunc<S, T>;
    }
    /**
     * Generates an observable sequence by running a state-driven loop
     * producing the sequence's elements, using the specified scheduler
     * to send out observer messages.
     *
     * <img src="./img/generate.png" width="100%">
     *
     * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
     * var res = Rx.Observable.generate(0, x => x < 10, x => x + 1, x => x);
     *
     * @example <caption>Using asap scheduler, produces sequence of 2, 3, 5, then completes.</caption>
     * var res = Rx.Observable.generate(1, x => x < 5, x =>  * 2, x => x + 1, Rx.Scheduler.asap);
     *
     * @see {@link from}
     * @see {@link create}
     *
     * @param {S} initialState Initial state.
     * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
     * @param {function (state: S): S} iterate Iteration step function.
     * @param {function (state: S): T} resultSelector Selector function for results produced in the sequence.
     * @param {Scheduler} [scheduler] A {@link SchedulerLike} on which to run the generator loop. If not provided, defaults to emit immediately.
     * @returns {Observable<T>} The generated sequence.
     */
    export function generate<T, S>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, resultSelector: ResultFunc<S, T>, scheduler?: SchedulerLike): Observable<T>;
    /**
     * Generates an observable sequence by running a state-driven loop
     * producing the sequence's elements, using the specified scheduler
     * to send out observer messages.
     * The overload uses state as an emitted value.
     *
     * <img src="./img/generate.png" width="100%">
     *
     * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
     * var res = Rx.Observable.generate(0, x => x < 10, x => x + 1);
     *
     * @example <caption>Using asap scheduler, produces sequence of 1, 2, 4, then completes.</caption>
     * var res = Rx.Observable.generate(1, x => x < 5, x => x  * 2, Rx.Scheduler.asap);
     *
     * @see {@link from}
     * @see {@link create}
     *
     * @param {S} initialState Initial state.
     * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
     * @param {function (state: S): S} iterate Iteration step function.
     * @param {Scheduler} [scheduler] A {@link SchedulerLike} on which to run the generator loop. If not provided, defaults to emit immediately.
     * @returns {Observable<S>} The generated sequence.
     */
    export function generate<S>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, scheduler?: SchedulerLike): Observable<S>;
    /**
     * Generates an observable sequence by running a state-driven loop
     * producing the sequence's elements, using the specified scheduler
     * to send out observer messages.
     * The overload accepts options object that might contain initial state, iterate,
     * condition and scheduler.
     *
     * <img src="./img/generate.png" width="100%">
     *
     * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
     * var res = Rx.Observable.generate({
     *   initialState: 0,
     *   condition: x => x < 10,
     *   iterate: x => x + 1
     * });
     *
     * @see {@link from}
     * @see {@link create}
     *
     * @param {GenerateBaseOptions<S>} options Object that must contain initialState, iterate and might contain condition and scheduler.
     * @returns {Observable<S>} The generated sequence.
     */
    export function generate<S>(options: GenerateBaseOptions<S>): Observable<S>;
    /**
     * Generates an observable sequence by running a state-driven loop
     * producing the sequence's elements, using the specified scheduler
     * to send out observer messages.
     * The overload accepts options object that might contain initial state, iterate,
     * condition, result selector and scheduler.
     *
     * <img src="./img/generate.png" width="100%">
     *
     * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
     * var res = Rx.Observable.generate({
     *   initialState: 0,
     *   condition: x => x < 10,
     *   iterate: x => x + 1,
     *   resultSelector: x => x
     * });
     *
     * @see {@link from}
     * @see {@link create}
     *
     * @param {GenerateOptions<T, S>} options Object that must contain initialState, iterate, resultSelector and might contain condition and scheduler.
     * @returns {Observable<T>} The generated sequence.
     */
    export function generate<T, S>(options: GenerateOptions<T, S>): Observable<T>;
    /**
     * Creates an Observable that emits sequential numbers every specified
     * interval of time, on a specified IScheduler.
     *
     * <span class="informal">Emits incremental numbers periodically in time.
     * </span>
     *
     * <img src="./img/interval.png" width="100%">
     *
     * `interval` returns an Observable that emits an infinite sequence of
     * ascending integers, with a constant interval of time of your choosing
     * between those emissions. The first emission is not sent immediately, but
     * only after the first period has passed. By default, this operator uses the
     * `async` IScheduler to provide a notion of time, but you may pass any
     * IScheduler to it.
     *
     * @example <caption>Emits ascending numbers, one every second (1000ms)</caption>
     * var numbers = Rx.Observable.interval(1000);
     * numbers.subscribe(x => console.log(x));
     *
     * @see {@link timer}
     * @see {@link delay}
     *
     * @param {number} [period=0] The interval size in milliseconds (by default)
     * or the time unit determined by the scheduler's clock.
     * @param {Scheduler} [scheduler=async] The IScheduler to use for scheduling
     * the emission of values, and providing a notion of "time".
     * @return {Observable} An Observable that emits a sequential number each time
     * interval.
     * @static true
     * @name interval
     * @owner Observable
     */
    export function interval(period?: number, scheduler?: SchedulerLike): Observable<number>;
    export function merge<T>(v1: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T>;
    export function merge<T>(v1: ObservableInput<T>, concurrent?: number, scheduler?: SchedulerLike): Observable<T>;
    export function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: SchedulerLike): Observable<T | T2>;
    export function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2>;
    export function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
    export function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
    export function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
    export function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
    export function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
    export function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
    export function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
    export function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
    export function merge<T>(...observables: (ObservableInput<T> | SchedulerLike | number)[]): Observable<T>;
    export function merge<T, R>(...observables: (ObservableInput<any> | SchedulerLike | number)[]): Observable<R>;
    /**
     * An Observable that emits no items to the Observer and never completes.
     *
     * <img src="./img/never.png" width="100%">
     *
     * A simple Observable that emits neither values nor errors nor the completion
     * notification. It can be used for testing purposes or for composing with other
     * Observables. Please note that by never emitting a complete notification, this
     * Observable keeps the subscription from being disposed automatically.
     * Subscriptions need to be manually disposed.
     *
     * @example <caption>Emit the number 7, then never emit anything else (not even complete).</caption>
     * function info() {
     *   console.log('Will not be called');
     * }
     * var result = NEVER.startWith(7);
     * result.subscribe(x => console.log(x), info, info);
     *
     * @see {@link create}
     * @see {@link EMPTY}
     * @see {@link of}
     * @see {@link throwError}
     */
    export const NEVER: Observable<never>;
    /**
     * @deprecated Deprecated in favor of using NEVER constant.
     */
    export function never(): Observable<never>;
    export function of<T>(a: T, scheduler?: SchedulerLike): Observable<T>;
    export function of<T, T2>(a: T, b: T2, scheduler?: SchedulerLike): Observable<T | T2>;
    export function of<T, T2, T3>(a: T, b: T2, c: T3, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
    export function of<T, T2, T3, T4>(a: T, b: T2, c: T3, d: T4, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
    export function of<T, T2, T3, T4, T5>(a: T, b: T2, c: T3, d: T4, e: T5, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
    export function of<T, T2, T3, T4, T5, T6>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
    export function of<T, T2, T3, T4, T5, T6, T7>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
    export function of<T, T2, T3, T4, T5, T6, T7, T8>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
    export function of<T, T2, T3, T4, T5, T6, T7, T8, T9>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, i: T9, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
    export function of<T>(...args: Array<T | SchedulerLike>): Observable<T>;
    export function onErrorResumeNext<R>(v: ObservableInput<R>): Observable<R>;
    export function onErrorResumeNext<T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<R>;
    export function onErrorResumeNext<T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<R>;
    export function onErrorResumeNext<T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<R>;
    export function onErrorResumeNext<T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<R>;
    export function onErrorResumeNext<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
    export function onErrorResumeNext<R>(array: ObservableInput<any>[]): Observable<R>;
    /**
     * Convert an object into an observable sequence of [key, value] pairs
     * using an optional IScheduler to enumerate the object.
     *
     * @example <caption>Converts a javascript object to an Observable</caption>
     * var obj = {
     *   foo: 42,
     *   bar: 56,
     *   baz: 78
     * };
     *
     * var source = Rx.Observable.pairs(obj);
     *
     * var subscription = source.subscribe(
     *   function (x) {
     *     console.log('Next: %s', x);
     *   },
     *   function (err) {
     *     console.log('Error: %s', err);
     *   },
     *   function () {
     *     console.log('Completed');
     *   });
     *
     * @param {Object} obj The object to inspect and turn into an
     * Observable sequence.
     * @param {Scheduler} [scheduler] An optional IScheduler to run the
     * enumeration of the input sequence on.
     * @returns {(Observable<[string, T]>)} An observable sequence of
     * [key, value] pairs from the object.
     */
    export function pairs<T>(obj: Object, scheduler?: SchedulerLike): Observable<[string, T]>;
    /**
     * Returns an Observable that mirrors the first source Observable to emit an item.
     * @param {...Observables} ...observables sources used to race for which Observable emits first.
     * @return {Observable} an Observable that mirrors the output of the first Observable to emit an item.
     * @static true
     * @name race
     * @owner Observable
     */
    export function race<T>(observables: Array<Observable<T>>): Observable<T>;
    export function race<T>(observables: Array<Observable<any>>): Observable<T>;
    export function race<T>(...observables: Array<Observable<T> | Array<Observable<T>>>): Observable<T>;
    /**
     * Creates an Observable that emits a sequence of numbers within a specified
     * range.
     *
     * <span class="informal">Emits a sequence of numbers in a range.</span>
     *
     * <img src="./img/range.png" width="100%">
     *
     * `range` operator emits a range of sequential integers, in order, where you
     * select the `start` of the range and its `length`. By default, uses no
     * IScheduler and just delivers the notifications synchronously, but may use
     * an optional IScheduler to regulate those deliveries.
     *
     * @example <caption>Emits the numbers 1 to 10</caption>
     * var numbers = Rx.Observable.range(1, 10);
     * numbers.subscribe(x => console.log(x));
     *
     * @see {@link timer}
     * @see {@link interval}
     *
     * @param {number} [start=0] The value of the first integer in the sequence.
     * @param {number} [count=0] The number of sequential integers to generate.
     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling
     * the emissions of the notifications.
     * @return {Observable} An Observable of numbers that emits a finite range of
     * sequential integers.
     * @static true
     * @name range
     * @owner Observable
     */
    export function range(start?: number, count?: number, scheduler?: SchedulerLike): Observable<number>;
    /**
     * Creates an Observable that starts emitting after an `initialDelay` and
     * emits ever increasing numbers after each `period` of time thereafter.
     *
     * <span class="informal">Its like {@link interval}, but you can specify when
     * should the emissions start.</span>
     *
     * <img src="./img/timer.png" width="100%">
     *
     * `timer` returns an Observable that emits an infinite sequence of ascending
     * integers, with a constant interval of time, `period` of your choosing
     * between those emissions. The first emission happens after the specified
     * `initialDelay`. The initial delay may be a {@link Date}. By default, this
     * operator uses the `async` IScheduler to provide a notion of time, but you
     * may pass any IScheduler to it. If `period` is not specified, the output
     * Observable emits only one value, `0`. Otherwise, it emits an infinite
     * sequence.
     *
     * @example <caption>Emits ascending numbers, one every second (1000ms), starting after 3 seconds</caption>
     * var numbers = Rx.Observable.timer(3000, 1000);
     * numbers.subscribe(x => console.log(x));
     *
     * @example <caption>Emits one number after five seconds</caption>
     * var numbers = Rx.Observable.timer(5000);
     * numbers.subscribe(x => console.log(x));
     *
     * @see {@link interval}
     * @see {@link delay}
     *
     * @param {number|Date} [dueTime] The initial delay time to wait before
     * emitting the first value of `0`.
     * @param {number|SchedulerLike} [periodOrScheduler] The period of time between emissions of the
     * subsequent numbers.
     * @param {SchedulerLike} [scheduler=async] The IScheduler to use for scheduling
     * the emission of values, and providing a notion of "time".
     * @return {Observable} An Observable that emits a `0` after the
     * `initialDelay` and ever increasing numbers after each `period` of time
     * thereafter.
     * @static true
     * @name timer
     * @owner Observable
     */
    export function timer(dueTime?: number | Date, periodOrScheduler?: number | SchedulerLike, scheduler?: SchedulerLike): Observable<number>;
    /**
     * Creates an Observable that uses a resource which will be disposed at the same time as the Observable.
     *
     * <span class="informal">Use it when you catch yourself cleaning up after an Observable.</span>
     *
     * `using` is a factory operator, which accepts two functions. First function returns a disposable resource.
     * It can be an arbitrary object that implements `unsubscribe` method. Second function will be injected with
     * that object and should return an Observable. That Observable can use resource object during its execution.
     * Both functions passed to `using` will be called every time someone subscribes - neither an Observable nor
     * resource object will be shared in any way between subscriptions.
     *
     * When Observable returned by `using` is subscribed, Observable returned from the second function will be subscribed
     * as well. All its notifications (nexted values, completion and error events) will be emitted unchanged by the output
     * Observable. If however someone unsubscribes from the Observable or source Observable completes or errors by itself,
     * the `unsubscribe` method on resource object will be called. This can be used to do any necessary clean up, which
     * otherwise would have to be handled by hand. Note that complete or error notifications are not emitted when someone
     * cancels subscription to an Observable via `unsubscribe`, so `using` can be used as a hook, allowing you to make
     * sure that all resources which need to exist during an Observable execution will be disposed at appropriate time.
     *
     * @see {@link defer}
     *
     * @param {function(): ISubscription} resourceFactory A function which creates any resource object
     * that implements `unsubscribe` method.
     * @param {function(resource: ISubscription): Observable<T>} observableFactory A function which
     * creates an Observable, that can use injected resource object.
     * @return {Observable<T>} An Observable that behaves the same as Observable returned by `observableFactory`, but
     * which - when completed, errored or unsubscribed - will also call `unsubscribe` on created resource object.
     */
    export function using<T>(resourceFactory: () => Unsubscribable | void, observableFactory: (resource: Unsubscribable | void) => ObservableInput<T> | void): Observable<T>;
    /** @deprecated resultSelector is no longer supported, pipe to map instead */
    export function zip<T, R>(v1: ObservableInput<T>, resultSelector: (v1: T) => R): Observable<R>;
    /** @deprecated resultSelector is no longer supported, pipe to map instead */
    export function zip<T, T2, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, resultSelector: (v1: T, v2: T2) => R): Observable<R>;
    /** @deprecated resultSelector is no longer supported, pipe to map instead */
    export function zip<T, T2, T3, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => R): Observable<R>;
    /** @deprecated resultSelector is no longer supported, pipe to map instead */
    export function zip<T, T2, T3, T4, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => R): Observable<R>;
    /** @deprecated resultSelector is no longer supported, pipe to map instead */
    export function zip<T, T2, T3, T4, T5, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): Observable<R>;
    /** @deprecated resultSelector is no longer supported, pipe to map instead */
    export function zip<T, T2, T3, T4, T5, T6, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): Observable<R>;
    export function zip<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
    export function zip<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
    export function zip<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
    export function zip<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
    export function zip<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
    export function zip<T>(array: ObservableInput<T>[]): Observable<T[]>;
    export function zip<R>(array: ObservableInput<any>[]): Observable<R>;
    /** @deprecated resultSelector is no longer supported, pipe to map instead */
    export function zip<T, R>(array: ObservableInput<T>[], resultSelector: (...values: Array<T>) => R): Observable<R>;
    /** @deprecated resultSelector is no longer supported, pipe to map instead */
    export function zip<R>(array: ObservableInput<any>[], resultSelector: (...values: Array<any>) => R): Observable<R>;
    export function zip<T>(...observables: Array<ObservableInput<T>>): Observable<T[]>;
    export function zip<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): Observable<R>;
    export function zip<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
    /**
     * The global configuration object for RxJS, used to configure things
     * like what Promise contructor should used to create Promises
     */
    export const config: {
        Promise: PromiseConstructorLike;
        useDeprecatedSynchronousErrorHandling: boolean;
    };
}

declare namespace rxjs.operators
{

    export function audit<T>(durationSelector: (value: T) => SubscribableOrPromise<any>): MonoTypeOperatorFunction<T>;
    export function auditTime<T>(duration: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function buffer<T>(closingNotifier: Observable<any>): OperatorFunction<T, T[]>;
    export function bufferCount<T>(bufferSize: number, startBufferEvery?: number): OperatorFunction<T, T[]>;
    export function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
    export function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
    export function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, maxBufferSize: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
    export function bufferToggle<T, O>(openings: SubscribableOrPromise<O>, closingSelector: (value: O) => SubscribableOrPromise<any>): OperatorFunction<T, T[]>;
    export function bufferWhen<T>(closingSelector: () => Observable<any>): OperatorFunction<T, T[]>;
    export function catchError<T>(selector: (err: any, caught: Observable<T>) => never): MonoTypeOperatorFunction<T>;
    export function catchError<T, R>(selector: (err: any, caught: Observable<T>) => ObservableInput<R>): OperatorFunction<T, T | R>;
    export function combineAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
    export function combineAll<T>(): OperatorFunction<any, T[]>;
    export function combineAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
    export function combineAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;
    export function combineLatest<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
    export function combineLatest<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
    export function combineLatest<T, T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): OperatorFunction<T, R>;
    export function combineLatest<T, T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): OperatorFunction<T, R>;
    export function combineLatest<T, T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): OperatorFunction<T, R>;
    export function combineLatest<T, T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): OperatorFunction<T, R>;
    export function combineLatest<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
    export function combineLatest<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
    export function combineLatest<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, [T, T2, T3, T4]>;
    export function combineLatest<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, [T, T2, T3, T4, T5]>;
    export function combineLatest<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, [T, T2, T3, T4, T5, T6]>;
    export function combineLatest<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): OperatorFunction<T, R>;
    export function combineLatest<T, R>(array: ObservableInput<T>[]): OperatorFunction<T, Array<T>>;
    export function combineLatest<T, TOther, R>(array: ObservableInput<TOther>[], project: (v1: T, ...values: Array<TOther>) => R): OperatorFunction<T, R>;
    export function concat<T>(scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function concat<T, T2>(v2: ObservableInput<T2>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2>;
    export function concat<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3>;
    export function concat<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
    export function concat<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
    export function concat<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
    export function concat<T>(...observables: Array<ObservableInput<T> | SchedulerLike>): MonoTypeOperatorFunction<T>;
    export function concat<T, R>(...observables: Array<ObservableInput<any> | SchedulerLike>): OperatorFunction<T, R>;
    export function concatAll<T>(): OperatorFunction<ObservableInput<T>, T>;
    export function concatAll<R>(): OperatorFunction<any, R>;
    export function concatMap<T, R>(project: (value: T, index: number) => ObservableInput<R>): OperatorFunction<T, R>;
    export function concatMap<T, R>(project: (value: T, index: number) => ObservableInput<R>, resultSelector: undefined): OperatorFunction<T, R>;
    export function concatMap<T, I, R>(project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
    export function concatMapTo<T>(observable: ObservableInput<T>): OperatorFunction<any, T>;
    export function concatMapTo<T>(observable: ObservableInput<T>, resultSelector: undefined): OperatorFunction<any, T>;
    export function concatMapTo<T, I, R>(observable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
    export function count<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, number>;
    export function debounce<T>(durationSelector: (value: T) => SubscribableOrPromise<any>): MonoTypeOperatorFunction<T>;
    export function debounceTime<T>(dueTime: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function defaultIfEmpty<T>(defaultValue?: T): MonoTypeOperatorFunction<T>;
    export function defaultIfEmpty<T, R>(defaultValue?: R): OperatorFunction<T, T | R>;
    export function delay<T>(delay: number | Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function delayWhen<T>(delayDurationSelector: (value: T) => Observable<never>, subscriptionDelay?: Observable<any>): MonoTypeOperatorFunction<T>;
    export function delayWhen<T>(delayDurationSelector: (value: T) => Observable<any>, subscriptionDelay?: Observable<any>): MonoTypeOperatorFunction<T>;
    class Notification<T> {
        kind: string;
        value?: T;
        error?: any;
        hasValue: boolean;
        constructor(kind: string, value?: T, error?: any);
        observe(observer: PartialObserver<T>): any;
        do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): any;
        accept(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void): any;
        toObservable(): Observable<T>;
        private static completeNotification;
        private static undefinedValueNotification;
        static createNext<T>(value: T): Notification<T>;
        static createError<T>(err?: any): Notification<T>;
        static createComplete(): Notification<any>;
    }
    export function dematerialize<T>(): OperatorFunction<Notification<T>, T>;
    export function distinct<T, K>(keySelector?: (value: T) => K, flushes?: Observable<any>): MonoTypeOperatorFunction<T>;
    export function distinctUntilChanged<T>(compare?: (x: T, y: T) => boolean): MonoTypeOperatorFunction<T>;
    export function distinctUntilChanged<T, K>(compare: (x: K, y: K) => boolean, keySelector: (x: T) => K): MonoTypeOperatorFunction<T>;
    export function distinctUntilKeyChanged<T>(key: string): MonoTypeOperatorFunction<T>;
    export function distinctUntilKeyChanged<T, K>(key: string, compare: (x: K, y: K) => boolean): MonoTypeOperatorFunction<T>;
    export function elementAt<T>(index: number, defaultValue?: T): MonoTypeOperatorFunction<T>;
    export function endWith<T>(scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function endWith<T>(v1: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function endWith<T>(v1: T, v2: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function endWith<T>(v1: T, v2: T, v3: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function endWith<T>(v1: T, v2: T, v3: T, v4: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function endWith<T>(v1: T, v2: T, v3: T, v4: T, v5: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function endWith<T>(v1: T, v2: T, v3: T, v4: T, v5: T, v6: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function endWith<T>(...array: Array<T | SchedulerLike>): MonoTypeOperatorFunction<T>;
    export function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, boolean>;
    export function exhaust<T>(): OperatorFunction<ObservableInput<T>, T>;
    export function exhaust<R>(): OperatorFunction<any, R>;
    export function exhaustMap<T, R>(project: (value: T, index: number) => ObservableInput<R>): OperatorFunction<T, R>;
    export function exhaustMap<T, R>(project: (value: T, index: number) => ObservableInput<R>, resultSelector: undefined): OperatorFunction<T, R>;
    export function exhaustMap<T, I, R>(project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
    export function expand<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, R>;
    export function expand<T>(project: (value: T, index: number) => ObservableInput<T>, concurrent?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function filter<T, S extends T>(predicate: (value: T, index: number) => value is S, thisArg?: any): OperatorFunction<T, S>;
    export function filter<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T>;
    export function finalize<T>(callback: () => void): MonoTypeOperatorFunction<T>;
    export function find<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, thisArg?: any): OperatorFunction<T, S>;
    export function find<T, S extends T>(predicate: (value: T, index: number) => value is S, thisArg?: any): OperatorFunction<T, S>;
    export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): MonoTypeOperatorFunction<T>;
    export function find<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T>;
    export function findIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, number>;
    export function first<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: T): MonoTypeOperatorFunction<T>;
    class Subject<T> extends Observable<T> implements SubscriptionLike
    {
        observers: Observer<T>[];
        closed: boolean;
        isStopped: boolean;
        hasError: boolean;
        thrownError: any;
        constructor();
        static create: Function;
        lift<R>(operator: Operator<T, R>): Observable<R>;
        next(value?: T): void;
        error(err: any): void;
        complete(): void;
        unsubscribe(): void;
        _trySubscribe(subscriber: Subscriber<T>): TeardownLogic;
        _subscribe(subscriber: Subscriber<T>): Subscription;
        asObservable(): Observable<T>;
    }
    export function groupBy<T, K>(keySelector: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;
    export function groupBy<T, K>(keySelector: (value: T) => K, elementSelector: void, durationSelector: (grouped: GroupedObservable<K, T>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, T>>;
    export function groupBy<T, K, R>(keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, R>>;
    export function groupBy<T, K, R>(keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>, subjectSelector?: () => Subject<R>): OperatorFunction<T, GroupedObservable<K, R>>;
    export interface RefCountSubscription
    {
        count: number;
        unsubscribe: () => void;
        closed: boolean;
        attemptedToUnsubscribe: boolean;
    }
    class GroupedObservable<K, T> extends Observable<T> {
        key: K;
        private groupSubject;
        private refCountSubscription?;
        constructor(key: K, groupSubject: Subject<T>, refCountSubscription?: RefCountSubscription);
        _subscribe(subscriber: Subscriber<T>): Subscription;
    }
    export function ignoreElements(): OperatorFunction<any, never>;
    export function isEmpty<T>(): OperatorFunction<T, boolean>;
    export function last<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: T): MonoTypeOperatorFunction<T>;
    export function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R>;
    export function mapTo<T, R>(value: R): OperatorFunction<T, R>;
    export function materialize<T>(): OperatorFunction<T, Notification<T>>;
    export function max<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;
    export function merge<T>(scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function merge<T>(concurrent?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function merge<T, T2>(v2: ObservableInput<T2>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2>;
    export function merge<T, T2>(v2: ObservableInput<T2>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2>;
    export function merge<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3>;
    export function merge<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3>;
    export function merge<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
    export function merge<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
    export function merge<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
    export function merge<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
    export function merge<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
    export function merge<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
    export function merge<T>(...observables: Array<ObservableInput<T> | SchedulerLike | number>): MonoTypeOperatorFunction<T>;
    export function merge<T, R>(...observables: Array<ObservableInput<any> | SchedulerLike | number>): OperatorFunction<T, R>;
    export function mergeAll<T>(concurrent?: number): OperatorFunction<ObservableInput<T>, T>;
    export function mergeMap<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent?: number): OperatorFunction<T, R>;
    export function mergeMap<T, R>(project: (value: T, index: number) => ObservableInput<R>, resultSelector: undefined, concurrent?: number): OperatorFunction<T, R>;
    export function mergeMap<T, I, R>(project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;
    export function mergeMapTo<T>(innerObservable: ObservableInput<T>, concurrent?: number): OperatorFunction<any, T>;
    export function mergeMapTo<T, I, R>(innerObservable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;
    export function mergeScan<T, R>(accumulator: (acc: R, value: T) => ObservableInput<R>, seed: R, concurrent?: number): OperatorFunction<T, R>;
    export function min<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;
    class ConnectableObservable<T> extends Observable<T> {
        source: Observable<T>;
        protected subjectFactory: () => Subject<T>;
        protected _subject: Subject<T>;
        protected _refCount: number;
        protected _connection: Subscription;
        _isComplete: boolean;
        constructor(source: Observable<T>, subjectFactory: () => Subject<T>);
        _subscribe(subscriber: Subscriber<T>): Subscription;
        protected getSubject(): Subject<T>;
        connect(): Subscription;
        refCount(): Observable<T>;
    }
    export function multicast<T>(subjectOrSubjectFactory: FactoryOrValue<Subject<T>>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
    export function multicast<T>(SubjectFactory: (this: Observable<T>) => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
    export function multicast<T>(SubjectFactory: (this: Observable<T>) => Subject<T>, selector?: MonoTypeOperatorFunction<T>): MonoTypeOperatorFunction<T>;
    export function multicast<T, R>(SubjectFactory: (this: Observable<T>) => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<R>>;
    export function multicast<T, R>(SubjectFactory: (this: Observable<T>) => Subject<T>, selector?: OperatorFunction<T, R>): OperatorFunction<T, R>;
    export function observeOn<T>(scheduler: SchedulerLike, delay?: number): MonoTypeOperatorFunction<T>;
    export function onErrorResumeNext<T, R>(v: ObservableInput<R>): OperatorFunction<T, R>;
    export function onErrorResumeNext<T, T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, R>;
    export function onErrorResumeNext<T, T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, R>;
    export function onErrorResumeNext<T, T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, R>;
    export function onErrorResumeNext<T, T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, R>;
    export function onErrorResumeNext<T, R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): OperatorFunction<T, R>;
    export function onErrorResumeNext<T, R>(array: ObservableInput<any>[]): OperatorFunction<T, R>;
    export function pairwise<T>(): OperatorFunction<T, [T, T]>;
    export function partition<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): UnaryFunction<Observable<T>, [Observable<T>, Observable<T>]>;
    export function pluck<T, R>(...properties: string[]): OperatorFunction<T, R>;
    export function publish<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
    export function publish<T, R>(selector: OperatorFunction<T, R>): OperatorFunction<T, R>;
    export function publish<T>(selector: MonoTypeOperatorFunction<T>): MonoTypeOperatorFunction<T>;
    export function publishBehavior<T>(value: T): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
    export function publishLast<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
    export function publishReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function publishReplay<T, R>(bufferSize?: number, windowTime?: number, selector?: OperatorFunction<T, R>, scheduler?: SchedulerLike): OperatorFunction<T, R>;
    export function publishReplay<T>(bufferSize?: number, windowTime?: number, selector?: MonoTypeOperatorFunction<T>, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function race<T>(observables: Array<Observable<T>>): MonoTypeOperatorFunction<T>;
    export function race<T, R>(observables: Array<Observable<T>>): OperatorFunction<T, R>;
    export function race<T>(...observables: Array<Observable<T> | Array<Observable<T>>>): MonoTypeOperatorFunction<T>;
    export function race<T, R>(...observables: Array<Observable<any> | Array<Observable<any>>>): OperatorFunction<T, R>;
    export function reduce<T>(accumulator: (acc: T, value: T, index: number) => T, seed?: T): MonoTypeOperatorFunction<T>;
    export function reduce<T>(accumulator: (acc: T[], value: T, index: number) => T[], seed: T[]): OperatorFunction<T, T[]>;
    export function reduce<T, R>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): OperatorFunction<T, R>;
    export function repeat<T>(count?: number): MonoTypeOperatorFunction<T>;
    export function repeatWhen<T>(notifier: (notifications: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T>;
    export function retry<T>(count?: number): MonoTypeOperatorFunction<T>;
    export function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T>;
    export function refCount<T>(): MonoTypeOperatorFunction<T>;
    export function sample<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;
    export function sampleTime<T>(period: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function scan<T>(accumulator: (acc: T, value: T, index: number) => T, seed?: T): MonoTypeOperatorFunction<T>;
    export function scan<T>(accumulator: (acc: T[], value: T, index: number) => T[], seed?: T[]): OperatorFunction<T, T[]>;
    export function scan<T, R>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): OperatorFunction<T, R>;
    export function sequenceEqual<T>(compareTo: Observable<T>, comparor?: (a: T, b: T) => boolean): OperatorFunction<T, boolean>;
    export function share<T>(): MonoTypeOperatorFunction<T>;
    export function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): MonoTypeOperatorFunction<T>;
    export function skip<T>(count: number): MonoTypeOperatorFunction<T>;
    export function skipLast<T>(count: number): MonoTypeOperatorFunction<T>;
    export function skipUntil<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;
    export function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;
    export function startWith<T>(v1: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function startWith<T>(v1: T, v2: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function startWith<T>(v1: T, v2: T, v3: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function startWith<T>(v1: T, v2: T, v3: T, v4: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function startWith<T>(v1: T, v2: T, v3: T, v4: T, v5: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function startWith<T>(v1: T, v2: T, v3: T, v4: T, v5: T, v6: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function startWith<T>(...array: Array<T | SchedulerLike>): MonoTypeOperatorFunction<T>;
    export function subscribeOn<T>(scheduler: SchedulerLike, delay?: number): MonoTypeOperatorFunction<T>;
    export function switchAll<T>(): OperatorFunction<ObservableInput<T>, T>;
    export function switchAll<R>(): OperatorFunction<any, R>;
    export function switchMap<T, R>(project: (value: T, index: number) => ObservableInput<R>): OperatorFunction<T, R>;
    export function switchMap<T, R>(project: (value: T, index: number) => ObservableInput<R>, resultSelector: undefined): OperatorFunction<T, R>;
    export function switchMap<T, I, R>(project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
    export function switchMapTo<R>(observable: ObservableInput<R>): OperatorFunction<any, R>;
    export function switchMapTo<T, R>(observable: ObservableInput<R>, resultSelector: undefined): OperatorFunction<T, R>;
    export function switchMapTo<T, I, R>(observable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
    export function take<T>(count: number): MonoTypeOperatorFunction<T>;
    export function takeLast<T>(count: number): MonoTypeOperatorFunction<T>;
    export function takeUntil<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;
    export function takeWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;
    export function tap<T>(next?: (x: T) => void, error?: (e: any) => void, complete?: () => void): MonoTypeOperatorFunction<T>;
    export function tap<T>(observer: PartialObserver<T>): MonoTypeOperatorFunction<T>;
    export interface ThrottleConfig
    {
        leading?: boolean;
        trailing?: boolean;
    }
    export function throttle<T>(durationSelector: (value: T) => SubscribableOrPromise<any>, config?: ThrottleConfig): MonoTypeOperatorFunction<T>;
    export function throttleTime<T>(duration: number, scheduler?: SchedulerLike, config?: ThrottleConfig): MonoTypeOperatorFunction<T>;
    export const throwIfEmpty: <T>(errorFactory?: () => any) => MonoTypeOperatorFunction<T>;
    export function timeInterval<T>(scheduler?: SchedulerLike): OperatorFunction<T, TimeInterval<T>>;
    class TimeInterval<T> {
        value: T;
        interval: number;
        constructor(value: T, interval: number);
    }
    export function timeout<T>(due: number | Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
    export function timeoutWith<T, R>(due: number | Date, withObservable: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;
    export function timestamp<T>(scheduler?: SchedulerLike): OperatorFunction<T, Timestamp<T>>;
    class Timestamp<T> implements TimestampInterface<T> {
        value: T;
        timestamp: number;
        constructor(value: T, timestamp: number);
    }
    export function toArray<T>(): OperatorFunction<T, T[]>;
    export function window<T>(windowBoundaries: Observable<any>): OperatorFunction<T, Observable<T>>;
    export function windowCount<T>(windowSize: number, startWindowEvery?: number): OperatorFunction<T, Observable<T>>;
    export function windowTime<T>(windowTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
    export function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
    export function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number, maxWindowSize: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
    export function windowToggle<T, O>(openings: Observable<O>, closingSelector: (openValue: O) => Observable<any>): OperatorFunction<T, Observable<T>>;
    export function windowWhen<T>(closingSelector: () => Observable<any>): OperatorFunction<T, Observable<T>>;
    export function withLatestFrom<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
    export function withLatestFrom<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
    export function withLatestFrom<T, T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): OperatorFunction<T, R>;
    export function withLatestFrom<T, T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): OperatorFunction<T, R>;
    export function withLatestFrom<T, T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): OperatorFunction<T, R>;
    export function withLatestFrom<T, T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): OperatorFunction<T, R>;
    export function withLatestFrom<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
    export function withLatestFrom<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
    export function withLatestFrom<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, [T, T2, T3, T4]>;
    export function withLatestFrom<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, [T, T2, T3, T4, T5]>;
    export function withLatestFrom<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, [T, T2, T3, T4, T5, T6]>;
    export function withLatestFrom<T, R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): OperatorFunction<T, R>;
    export function withLatestFrom<T, R>(array: ObservableInput<any>[]): OperatorFunction<T, R>;
    export function withLatestFrom<T, R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R): OperatorFunction<T, R>;
    export function zip<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
    export function zip<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
    export function zip<T, T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): OperatorFunction<T, R>;
    export function zip<T, T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): OperatorFunction<T, R>;
    export function zip<T, T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): OperatorFunction<T, R>;
    export function zip<T, T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): OperatorFunction<T, R>;
    export function zip<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
    export function zip<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
    export function zip<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, [T, T2, T3, T4]>;
    export function zip<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, [T, T2, T3, T4, T5]>;
    export function zip<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, [T, T2, T3, T4, T5, T6]>;
    export function zip<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): OperatorFunction<T, R>;
    export function zip<T, R>(array: Array<ObservableInput<T>>): OperatorFunction<T, R>;
    export function zip<T, TOther, R>(array: Array<ObservableInput<TOther>>, project: (v1: T, ...values: Array<TOther>) => R): OperatorFunction<T, R>;
    export function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
    export function zipAll<T>(): OperatorFunction<any, T[]>;
    export function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
    export function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;
}
