import { TypedHash } from "../collections/collections";
import { SharePointQueryable, SharePointQueryableInstance, SharePointQueryableCollection } from "./sharepointqueryable";
/**
 * Result from adding a navigation node
 *
 */
export interface NavigationNodeAddResult {
    data: any;
    node: NavigationNode;
}
/**
 * Result from udpdating a navigation node
 *
 */
export interface NavigationNodeUpdateResult {
    data: any;
    node: NavigationNode;
}
/**
 * Represents a collection of navigation nodes
 *
 */
export declare class NavigationNodes extends SharePointQueryableCollection {
    /**
     * Gets a navigation node by id
     *
     * @param id The id of the node
     */
    getById(id: number): NavigationNode;
    /**
     * Adds a new node to the collection
     *
     * @param title Display name of the node
     * @param url The url of the node
     * @param visible If true the node is visible, otherwise it is hidden (default: true)
     */
    add(title: string, url: string, visible?: boolean): Promise<NavigationNodeAddResult>;
    /**
     * Moves a node to be after another node in the navigation
     *
     * @param nodeId Id of the node to move
     * @param previousNodeId Id of the node after which we move the node specified by nodeId
     */
    moveAfter(nodeId: number, previousNodeId: number): Promise<void>;
}
/**
 * Represents an instance of a navigation node
 *
 */
export declare class NavigationNode extends SharePointQueryableInstance {
    /**
     * Represents the child nodes of this node
     */
    readonly children: NavigationNodes;
    /**
     * Updates this node based on the supplied properties
     *
     * @param properties The hash of key/value pairs to update
     */
    update(properties: TypedHash<boolean | string | number>): Promise<NavigationNodeUpdateResult>;
    /**
     * Deletes this node and any child nodes
     */
    delete(): Promise<void>;
}
/**
 * Exposes the navigation components
 *
 */
export declare class Navigation extends SharePointQueryable {
    /**
     * Creates a new instance of the Navigation class
     *
     * @param baseUrl The url or SharePointQueryable which forms the parent of these navigation components
     */
    constructor(baseUrl: string | SharePointQueryable, path?: string);
    /**
     * Gets the quicklaunch navigation nodes for the current context
     *
     */
    readonly quicklaunch: NavigationNodes;
    /**
     * Gets the top bar navigation nodes for the current context
     *
     */
    readonly topNavigationBar: NavigationNodes;
}
