const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blogs");
const { server } = require("../index");

beforeEach(async () => {
    await Blog.deleteMany({});
    const blogObjects = helper.initialBlogs.map((b) => new Blog(b));
    const promiseArray = blogObjects.map((b) => b.save());
    await Promise.all(promiseArray);
});

describe("when there is initially some blogs saved", () => {
    test("blogs are returned as json", async () => {
        await api
            .get("/api/blogs")
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    test("there are 6 blogs", async () => {
        const response = await api.get("/api/blogs");

        expect(response.body).toHaveLength(helper.initialBlogs.length);
    });

    test("a blog about React patterns is within the returned blogs", async () => {
        const response = await api.get("/api/blogs");

        const contents = response.body.map((r) => r.title);
        expect(contents).toContain("React patterns");
    });

    test("id property is defined for all blogs", async () => {
        const response = await api.get("/api/blogs");

        response.body.forEach((b) => expect(b.id).toBeDefined());
    });
});

describe("viewing a specific blog", () => {
    test("succeeds with a valid id", async () => {
        const blogsAtStart = await helper.blogsInDb();

        const blogToView = blogsAtStart[0];

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(resultBlog.body).toEqual(blogToView);
    });

    test("fails with statuscode 404 if blog does not exist", async () => {
        const validNonexistingId = await helper.nonExistingId();

        await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
    });

    test("fails with statuscode 400 id is invalid", async () => {
        const invalidId = "5a3d5da59070081a82a3445";
        await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
});

describe("addition of a new blog", () => {
    test("a valid blog can be added", async () => {
        const newBlog = {
            title: "Nauges",
            author: "Louis Nauges",
            url: "https://nauges.typepad.com/",
            likes: 5,
        };

        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const blogsAtEnd = await helper.blogsInDb();
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

        const titles = blogsAtEnd.map((b) => b.title);
        expect(titles).toContain("Nauges");
    });

    test("likes value for a new blog is 0 by default", async () => {
        const newBlog = {
            title: "Nauges",
            author: "Louis Nauges",
            url: "https://nauges.typepad.com/",
        };

        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const blogsAtEnd = await helper.blogsInDb();
        const blog = blogsAtEnd.find((b) => b.title === "Nauges");

        expect(blog).toBeDefined();
        expect(blog.likes).toBe(0);
    });

    test("fails with statuscode 400 if data invalid", async () => {
        const newBlog = {
            title: "Nauges",
            author: "Louis Nauges",
            likes: 4000,
        };

        await api.post("/api/blogs").send(newBlog).expect(400);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });
});

describe("deletion one blog", () => {
    test("succeeds with status code 204 if id is invalid", async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogDelete = blogsAtStart[3];
        await api.delete(`/api/blogs/${blogDelete.id}`).expect(204);

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

        const title = blogsAtEnd.map(blog => blog.title)

        expect(title).not.toContain(blogDelete.title)

    });
});

afterAll(() => {
    mongoose.connection.close();
    server.close();
});
